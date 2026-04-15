using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Clients;

public record GetClientDetailQuery(Guid ClientId, Guid CoachId) : IRequest<ClientDto>;
