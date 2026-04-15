using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.ConnectionRequests;

public record ReviewConnectionRequestCommand(
    Guid RequestId,
    Guid CoachId,
    bool Accept) : IRequest<ConnectionRequestDto>;
