using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Reviews;

public record GetClientReviewsQuery(Guid ClientRelationshipId, Guid RequestingUserId) : IRequest<List<ReviewDto>>;
