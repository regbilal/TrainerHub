using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.ConnectionRequests;

public record GetPendingRequestsQuery(Guid CoachId) : IRequest<List<ConnectionRequestDto>>;
