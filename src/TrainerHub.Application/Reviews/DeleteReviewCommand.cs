using MediatR;

namespace TrainerHub.Application.Reviews;

public record DeleteReviewCommand(Guid ReviewId, Guid RequestingUserId) : IRequest<bool>;
