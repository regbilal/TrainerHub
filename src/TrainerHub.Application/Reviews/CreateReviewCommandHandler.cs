using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Reviews;

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, ReviewDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public CreateReviewCommandHandler(IApplicationDbContext context, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _localizer = localizer;
    }

    public async Task<ReviewDto> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        if (request.Rating < 1 || request.Rating > 5)
            throw new ArgumentException(_localizer["RatingOutOfRange"]);

        var clientRel = await _context.Clients
            .Include(c => c.Coach)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == request.ClientRelationshipId, cancellationToken)
            ?? throw new KeyNotFoundException(_localizer["RelationshipNotFound"]);

        Guid revieweeUserId;
        if (request.ReviewerUserId == clientRel.CoachId)
        {
            revieweeUserId = clientRel.UserId
                ?? throw new InvalidOperationException(_localizer["ClientNoLinkedUser"]);
        }
        else if (clientRel.UserId == request.ReviewerUserId)
        {
            revieweeUserId = clientRel.CoachId;
        }
        else
        {
            throw new UnauthorizedAccessException(_localizer["NotPartOfRelationship"]);
        }

        var existing = await _context.Reviews
            .AnyAsync(r => r.ClientRelationshipId == request.ClientRelationshipId
                        && r.ReviewerUserId == request.ReviewerUserId, cancellationToken);

        if (existing)
            throw new InvalidOperationException(_localizer["AlreadyReviewed"]);

        var reviewer = await _context.Users.FindAsync(new object[] { request.ReviewerUserId }, cancellationToken)
            ?? throw new KeyNotFoundException(_localizer["ReviewerNotFound"]);
        var reviewee = await _context.Users.FindAsync(new object[] { revieweeUserId }, cancellationToken)
            ?? throw new KeyNotFoundException(_localizer["RevieweeNotFound"]);

        var review = new Review
        {
            Id = Guid.NewGuid(),
            ClientRelationshipId = request.ClientRelationshipId,
            ReviewerUserId = request.ReviewerUserId,
            RevieweeUserId = revieweeUserId,
            Rating = request.Rating,
            Comment = request.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync(cancellationToken);

        return new ReviewDto(
            review.Id,
            review.ReviewerUserId,
            $"{reviewer.FirstName} {reviewer.LastName}",
            review.RevieweeUserId,
            $"{reviewee.FirstName} {reviewee.LastName}",
            review.Rating,
            review.Comment,
            review.CreatedAt,
            review.UpdatedAt);
    }
}
