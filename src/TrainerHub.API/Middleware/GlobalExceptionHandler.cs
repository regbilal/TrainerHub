using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.Resources;

namespace TrainerHub.API.Middleware;

public class GlobalExceptionHandler
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public GlobalExceptionHandler(RequestDelegate next, ILogger<GlobalExceptionHandler> logger, IStringLocalizer<ErrorMessages> localizer)
    {
        _next = next;
        _logger = logger;
        _localizer = localizer;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found");
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = ex.Message }));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access");
            context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = ex.Message }));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation");
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = ex.Message }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = (string)_localizer["UnexpectedError"] }));
        }
    }
}
