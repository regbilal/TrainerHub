using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrainerHub.Infrastructure.Data;

namespace TrainerHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ErrorLogsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ErrorLogsController(ApplicationDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? exceptionType,
        [FromQuery] int? statusCode,
        [FromQuery] string? httpMethod,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.ErrorLogs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(e =>
                (e.Message != null && e.Message.ToLower().Contains(term)) ||
                (e.RequestPath != null && e.RequestPath.ToLower().Contains(term)) ||
                (e.RequestBody != null && e.RequestBody.ToLower().Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(exceptionType))
        {
            var type = exceptionType.Trim().ToLower();
            query = query.Where(e => e.ExceptionType != null && e.ExceptionType.ToLower().Contains(type));
        }

        if (statusCode.HasValue)
            query = query.Where(e => e.StatusCode == statusCode.Value);

        if (!string.IsNullOrWhiteSpace(httpMethod))
            query = query.Where(e => e.HttpMethod == httpMethod.ToUpper());

        if (from.HasValue)
            query = query.Where(e => e.OccurredAt >= from.Value);

        if (to.HasValue)
            query = query.Where(e => e.OccurredAt <= to.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(e => e.OccurredAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new
            {
                e.Id,
                e.OccurredAt,
                e.RequestPath,
                e.HttpMethod,
                e.StatusCode,
                e.ExceptionType,
                e.Message,
                e.StackTrace,
                e.InnerExceptionMessage,
                e.UserId,
                e.ClientIpAddress,
                e.RequestBody,
                e.QueryString
            })
            .ToListAsync();

        return Ok(new { items, totalCount, page, pageSize });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var log = await _context.ErrorLogs.FindAsync(id);
        if (log is null) return NotFound();
        _context.ErrorLogs.Remove(log);
        await _context.SaveChangesAsync(default);
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteAll()
    {
        await _context.ErrorLogs.ExecuteDeleteAsync();
        return NoContent();
    }
}
