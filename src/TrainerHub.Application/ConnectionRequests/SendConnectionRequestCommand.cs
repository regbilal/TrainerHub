using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.ConnectionRequests;

public record SendConnectionRequestCommand(
    Guid CoachId,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string? Email,
    string? Message) : IRequest<ConnectionRequestDto>;
