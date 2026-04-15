using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainerHub.Application.ConnectionRequests;
using TrainerHub.Application.DTOs;

namespace TrainerHub.API.Controllers;

[ApiController]
[Route("api/connection-requests")]
[Authorize]
public class ConnectionRequestsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ConnectionRequestsController(IMediator mediator) => _mediator = mediator;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<ConnectionRequestDto>>> GetPending()
    {
        var result = await _mediator.Send(new GetPendingRequestsQuery(GetUserId()));
        return Ok(result);
    }

    [HttpPut("{id}/accept")]
    public async Task<ActionResult<ConnectionRequestDto>> Accept(Guid id)
    {
        var result = await _mediator.Send(new ReviewConnectionRequestCommand(id, GetUserId(), true));
        return Ok(result);
    }

    [HttpPut("{id}/reject")]
    public async Task<ActionResult<ConnectionRequestDto>> Reject(Guid id)
    {
        var result = await _mediator.Send(new ReviewConnectionRequestCommand(id, GetUserId(), false));
        return Ok(result);
    }
}
