using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Programs;

namespace TrainerHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProgramsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProgramsController(IMediator mediator) => _mediator = mediator;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<TrainingProgramDto>>> GetPrograms()
    {
        var result = await _mediator.Send(new GetCoachProgramsQuery(GetUserId()));
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TrainingProgramDto>> GetProgram(Guid id)
    {
        var result = await _mediator.Send(new GetProgramDetailQuery(id));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<TrainingProgramDto>> CreateProgram([FromBody] CreateProgramRequest request)
    {
        var result = await _mediator.Send(new CreateProgramCommand(
            request.Name, request.Description, GetUserId(), request.Exercises));
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TrainingProgramDto>> UpdateProgram(Guid id, [FromBody] UpdateProgramRequest request)
    {
        var result = await _mediator.Send(new UpdateProgramCommand(
            id, request.Name, request.Description, GetUserId(), request.Exercises));
        return Ok(result);
    }

    [HttpPost("{programId}/assign")]
    public async Task<ActionResult<ProgramAssignmentDto>> AssignProgram(Guid programId, [FromBody] AssignProgramRequest request)
    {
        var result = await _mediator.Send(new AssignProgramCommand(programId, request.ClientId, GetUserId()));
        return Ok(result);
    }
}

public record CreateProgramRequest(string Name, string? Description, List<CreateExerciseDto> Exercises);
public record UpdateProgramRequest(string Name, string? Description, List<CreateExerciseDto> Exercises);
public record AssignProgramRequest(Guid ClientId);
