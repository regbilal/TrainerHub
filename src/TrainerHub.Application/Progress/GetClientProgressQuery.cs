using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Progress;

public record GetClientProgressQuery(Guid ClientId) : IRequest<List<ProgressEntryDto>>;
