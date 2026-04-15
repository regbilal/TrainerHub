using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Reviews;

public class DeleteReviewCommandHandler : IRequestHandler<DeleteReviewCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public DeleteReviewCommandHandler(IApplicationDbContext context, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _localizer = localizer;
    }

    public async Task<bool> Handle(DeleteReviewCommand request, CancellationToken cancellationToken)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == request.ReviewId, cancellationToken)
            ?? throw new KeyNotFoundException(_localizer["ReviewNotFound"]);

        if (review.ReviewerUserId != request.RequestingUserId)
            throw new UnauthorizedAccessException(_localizer["CanOnlyDeleteOwnReview"]);

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
