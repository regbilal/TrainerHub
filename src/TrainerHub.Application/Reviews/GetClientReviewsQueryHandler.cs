using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Reviews;

public class GetClientReviewsQueryHandler : IRequestHandler<GetClientReviewsQuery, List<ReviewDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public GetClientReviewsQueryHandler(IApplicationDbContext context, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _localizer = localizer;
    }

    public async Task<List<ReviewDto>> Handle(GetClientReviewsQuery request, CancellationToken cancellationToken)
    {
        var clientRel = await _context.Clients
            .FirstOrDefaultAsync(c => c.Id == request.ClientRelationshipId, cancellationToken)
            ?? throw new KeyNotFoundException(_localizer["RelationshipNotFound"]);

        if (clientRel.CoachId != request.RequestingUserId && clientRel.UserId != request.RequestingUserId)
            throw new UnauthorizedAccessException(_localizer["NotPartOfRelationshipGeneric"]);

        return await _context.Reviews
            .Include(r => r.Reviewer)
            .Include(r => r.Reviewee)
            .Where(r => r.ClientRelationshipId == request.ClientRelationshipId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto(
                r.Id,
                r.ReviewerUserId,
                r.Reviewer.FirstName + " " + r.Reviewer.LastName,
                r.RevieweeUserId,
                r.Reviewee.FirstName + " " + r.Reviewee.LastName,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                r.UpdatedAt))
            .ToListAsync(cancellationToken);
    }
}
