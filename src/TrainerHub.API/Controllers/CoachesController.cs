using MediatR;
using Microsoft.AspNetCore.Mvc;
using TrainerHub.Application.Coaches;
using TrainerHub.Application.ConnectionRequests;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Reviews;

namespace TrainerHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoachesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CoachesController(IMediator mediator) => _mediator = mediator;

    [HttpGet("search")]
    public async Task<ActionResult<List<CoachSearchResultDto>>> Search([FromQuery] string? q)
    {
        var result = await _mediator.Send(new SearchCoachesQuery(q));
        return Ok(result);
    }

    [HttpGet("{id}/reviews")]
    public async Task<ActionResult<List<ReviewDto>>> GetReviews(Guid id)
    {
        var result = await _mediator.Send(new GetCoachReviewsQuery(id));
        return Ok(result);
    }

    [HttpPost("connect")]
    public async Task<ActionResult<ConnectionRequestDto>> Connect([FromBody] CreateConnectionRequestDto request)
    {
        var result = await _mediator.Send(new SendConnectionRequestCommand(
            request.CoachId, request.FirstName, request.LastName,
            request.PhoneNumber, request.Email, request.Message));
        return Ok(result);
    }
}
