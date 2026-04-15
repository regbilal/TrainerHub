using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Reviews;

public record CreateReviewCommand(
    Guid ReviewerUserId,
    Guid ClientRelationshipId,
    int Rating,
    string Comment) : IRequest<ReviewDto>;
