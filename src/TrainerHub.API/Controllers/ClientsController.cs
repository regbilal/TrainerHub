using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainerHub.Application.Clients;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Progress;
using TrainerHub.Application.Programs;

namespace TrainerHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ClientsController(IMediator mediator) => _mediator = mediator;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<ClientDto>>> GetClients()
    {
        var result = await _mediator.Send(new GetCoachClientsQuery(GetUserId()));
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClientDto>> GetClient(Guid id)
    {
        var result = await _mediator.Send(new GetClientDetailQuery(id, GetUserId()));
        return Ok(result);
    }

    [HttpPost("invite")]
    public async Task<ActionResult<ClientDto>> InviteClient([FromBody] InviteClientRequest request)
    {
        var result = await _mediator.Send(new InviteClientCommand(
            GetUserId(), request.FirstName, request.LastName, request.PhoneNumber));
        return Ok(result);
    }

    [HttpGet("{clientId}/progress")]
    public async Task<ActionResult<List<ProgressEntryDto>>> GetClientProgress(Guid clientId)
    {
        var result = await _mediator.Send(new GetClientProgressQuery(clientId));
        return Ok(result);
    }

    [HttpGet("{clientId}/workout-logs")]
    public async Task<ActionResult<List<WorkoutLogDto>>> GetClientWorkoutLogs(Guid clientId, [FromQuery] Guid? assignmentId)
    {
        var result = await _mediator.Send(new GetClientWorkoutLogsQuery(clientId, assignmentId));
        return Ok(result);
    }

    [HttpGet("{clientId}/assignments")]
    public async Task<ActionResult<List<ProgramAssignmentDto>>> GetClientAssignments(Guid clientId)
    {
        var result = await _mediator.Send(new GetClientAssignmentsQuery(clientId));
        return Ok(result);
    }
}

public record InviteClientRequest(string FirstName, string LastName, string PhoneNumber);
