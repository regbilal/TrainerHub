using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Progress;
using TrainerHub.Application.Programs;

namespace TrainerHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProgressController(IMediator mediator) => _mediator = mediator;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("workout")]
    public async Task<ActionResult<WorkoutLogDto>> LogWorkout([FromBody] LogWorkoutRequest request)
    {
        var result = await _mediator.Send(new LogWorkoutCommand(
            GetUserId(), request.ProgramAssignmentId, request.ExerciseId,
            request.SetsCompleted, request.RepsCompleted, request.WeightUsed,
            request.DurationSeconds, request.Notes));
        return Ok(result);
    }

    [HttpPost("entry")]
    public async Task<ActionResult<ProgressEntryDto>> AddProgressEntry([FromBody] AddProgressEntryRequest request)
    {
        var result = await _mediator.Send(new AddProgressEntryCommand(
            GetUserId(), request.Weight, request.BodyFatPercentage, request.Notes));
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<ProgressEntryDto>>> GetProgress()
    {
        var result = await _mediator.Send(new GetClientProgressQuery(GetUserId()));
        return Ok(result);
    }

    [HttpGet("workouts")]
    public async Task<ActionResult<List<WorkoutLogDto>>> GetWorkoutLogs([FromQuery] Guid? assignmentId)
    {
        var result = await _mediator.Send(new GetClientWorkoutLogsQuery(GetUserId(), assignmentId));
        return Ok(result);
    }

    [HttpGet("assignments")]
    public async Task<ActionResult<List<ProgramAssignmentDto>>> GetAssignments()
    {
        var result = await _mediator.Send(new GetClientAssignmentsQuery(GetUserId()));
        return Ok(result);
    }
}

public record LogWorkoutRequest(Guid ProgramAssignmentId, Guid ExerciseId, int? SetsCompleted, int? RepsCompleted, decimal? WeightUsed, int? DurationSeconds, string? Notes);
public record AddProgressEntryRequest(decimal? Weight, decimal? BodyFatPercentage, string? Notes);
