using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Clients;

public record GetCoachClientsQuery(Guid CoachId) : IRequest<List<ClientDto>>;
