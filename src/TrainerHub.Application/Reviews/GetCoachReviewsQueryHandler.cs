using MediatR;
using Microsoft.EntityFrameworkCore;
using TrainerHub.Application.DTOs;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Reviews;

public class GetCoachReviewsQueryHandler : IRequestHandler<GetCoachReviewsQuery, List<ReviewDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCoachReviewsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<ReviewDto>> Handle(GetCoachReviewsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Reviews
            .Include(r => r.Reviewer)
            .Include(r => r.Reviewee)
            .Where(r => r.RevieweeUserId == request.CoachId)
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
