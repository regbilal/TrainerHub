using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.MealPrograms;

namespace TrainerHub.API.Controllers;

[ApiController]
[Route("api/meal-programs")]
[Authorize]
public class MealProgramsController : ControllerBase
{
    private readonly IMediator _mediator;

    public MealProgramsController(IMediator mediator) => _mediator = mediator;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<MealProgramListDto>>> GetMealPrograms()
    {
        var result = await _mediator.Send(new GetMealProgramsQuery(GetUserId()));
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MealProgramDto>> GetMealProgram(Guid id)
    {
        var result = await _mediator.Send(new GetMealProgramDetailQuery(id, GetUserId()));
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<MealProgramDto>> CreateMealProgram([FromBody] CreateMealProgramRequest request)
    {
        var result = await _mediator.Send(new CreateMealProgramCommand(
            request.Name, request.Description, GetUserId(), request.Days));
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MealProgramDto>> UpdateMealProgram(Guid id, [FromBody] UpdateMealProgramRequest request)
    {
        var result = await _mediator.Send(new UpdateMealProgramCommand(
            id, request.Name, request.Description, GetUserId(), request.Days));
        return Ok(result);
    }

    [HttpPost("assign")]
    public async Task<ActionResult<MealProgramAssignmentDto>> AssignMealProgram([FromBody] AssignMealProgramRequest request)
    {
        var result = await _mediator.Send(new AssignMealProgramCommand(
            request.MealProgramId, request.ClientId, GetUserId()));
        return Ok(result);
    }

    [HttpGet("assignments")]
    public async Task<ActionResult<List<MealProgramAssignmentDto>>> GetClientMealAssignments()
    {
        var result = await _mediator.Send(new GetClientMealAssignmentsQuery(GetUserId()));
        return Ok(result);
    }
}

public record CreateMealProgramRequest(string Name, string? Description, List<CreateMealDayDto> Days);
public record UpdateMealProgramRequest(string Name, string? Description, List<CreateMealDayDto> Days);
public record AssignMealProgramRequest(Guid MealProgramId, Guid ClientId);
