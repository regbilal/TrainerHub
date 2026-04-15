using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Clients;

public record InviteClientCommand(
    Guid CoachId,
    string FirstName,
    string LastName,
    string PhoneNumber) : IRequest<ClientDto>;
