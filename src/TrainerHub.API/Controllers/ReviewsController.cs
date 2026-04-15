using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Reviews;

namespace TrainerHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReviewsController(IMediator mediator) => _mediator = mediator;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<ReviewDto>> Create([FromBody] CreateReviewDto dto)
    {
        var result = await _mediator.Send(new CreateReviewCommand(
            GetUserId(), dto.ClientRelationshipId, dto.Rating, dto.Comment));
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ReviewDto>> Update(Guid id, [FromBody] CreateReviewDto dto)
    {
        var result = await _mediator.Send(new UpdateReviewCommand(
            id, GetUserId(), dto.Rating, dto.Comment));
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteReviewCommand(id, GetUserId()));
        return NoContent();
    }

    [HttpGet("client/{clientId}")]
    public async Task<ActionResult<List<ReviewDto>>> GetForClient(Guid clientId)
    {
        var result = await _mediator.Send(new GetClientReviewsQuery(clientId, GetUserId()));
        return Ok(result);
    }
}
