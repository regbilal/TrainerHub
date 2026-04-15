using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Reviews;

public record UpdateReviewCommand(
    Guid ReviewId,
    Guid RequestingUserId,
    int Rating,
    string Comment) : IRequest<ReviewDto>;
