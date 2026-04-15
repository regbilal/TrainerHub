using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Entities;
using TrainerHub.Infrastructure.Data;

namespace TrainerHub.API.Middleware;

public class GlobalExceptionHandler
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(RequestDelegate next, ILogger<GlobalExceptionHandler> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        context.Request.EnableBuffering();

        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);

            await PersistErrorLog(context, ex);

            var (statusCode, message) = ex switch
            {
                KeyNotFoundException => (HttpStatusCode.NotFound, ex.Message),
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized, ex.Message),
                InvalidOperationException => (HttpStatusCode.BadRequest, ex.Message),
                _ => (HttpStatusCode.InternalServerError, GetFallbackMessage(context))
            };

            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = message }));
        }
    }

    private async Task PersistErrorLog(HttpContext context, Exception ex)
    {
        try
        {
            using var scope = context.RequestServices.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            string? requestBody = null;
            try
            {
                context.Request.Body.Position = 0;
                using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
                var body = await reader.ReadToEndAsync();
                if (!string.IsNullOrWhiteSpace(body))
                    requestBody = body.Length > 4000 ? body[..4000] : body;
            }
            catch { /* body read failure is non-critical */ }

            Guid? userId = null;
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdClaim, out var parsed))
                userId = parsed;

            var errorLog = new ErrorLog
            {
                Id = Guid.NewGuid(),
                OccurredAt = DateTime.UtcNow,
                RequestPath = Truncate($"{context.Request.Path}", 500),
                HttpMethod = context.Request.Method,
                ExceptionType = Truncate(ex.GetType().FullName, 512),
                Message = Truncate(ex.Message, 2000),
                StackTrace = ex.StackTrace,
                InnerExceptionMessage = Truncate(ex.InnerException?.Message, 2000),
                UserId = userId,
                ClientIpAddress = Truncate(context.Connection.RemoteIpAddress?.ToString(), 64),
                RequestBody = requestBody,
                QueryString = Truncate(context.Request.QueryString.ToString(), 1000)
            };

            db.ErrorLogs.Add(errorLog);
            await db.SaveChangesAsync(default);
        }
        catch (Exception logEx)
        {
            _logger.LogError(logEx, "Failed to persist error log to database");
        }
    }

    private static string GetFallbackMessage(HttpContext context)
    {
        try
        {
            var localizer = context.RequestServices.GetService<IStringLocalizer<ErrorMessages>>();
            return localizer?["UnexpectedError"] ?? "An unexpected error occurred.";
        }
        catch
        {
            return "An unexpected error occurred.";
        }
    }

    private static string? Truncate(string? value, int maxLength)
    {
        if (value is null) return null;
        return value.Length <= maxLength ? value : value[..maxLength];
    }
}
