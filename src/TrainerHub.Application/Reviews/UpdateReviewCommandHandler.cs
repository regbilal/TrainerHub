using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Reviews;

public class UpdateReviewCommandHandler : IRequestHandler<UpdateReviewCommand, ReviewDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public UpdateReviewCommandHandler(IApplicationDbContext context, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _localizer = localizer;
    }

    public async Task<ReviewDto> Handle(UpdateReviewCommand request, CancellationToken cancellationToken)
    {
        if (request.Rating < 1 || request.Rating > 5)
            throw new ArgumentException(_localizer["RatingOutOfRange"]);

        var review = await _context.Reviews
            .Include(r => r.Reviewer)
            .Include(r => r.Reviewee)
            .FirstOrDefaultAsync(r => r.Id == request.ReviewId, cancellationToken)
            ?? throw new KeyNotFoundException(_localizer["ReviewNotFound"]);

        if (review.ReviewerUserId != request.RequestingUserId)
            throw new UnauthorizedAccessException(_localizer["CanOnlyUpdateOwnReview"]);

        review.Rating = request.Rating;
        review.Comment = request.Comment.Trim();
        review.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new ReviewDto(
            review.Id,
            review.ReviewerUserId,
            $"{review.Reviewer.FirstName} {review.Reviewer.LastName}",
            review.RevieweeUserId,
            $"{review.Reviewee.FirstName} {review.Reviewee.LastName}",
            review.Rating,
            review.Comment,
            review.CreatedAt,
            review.UpdatedAt);
    }
}
