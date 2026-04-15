using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Reviews;

public record GetCoachReviewsQuery(Guid CoachId) : IRequest<List<ReviewDto>>;
