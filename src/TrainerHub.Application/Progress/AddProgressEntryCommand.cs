using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Progress;

public record AddProgressEntryCommand(
    Guid ClientId,
    decimal? Weight,
    decimal? BodyFatPercentage,
    string? Notes) : IRequest<ProgressEntryDto>;
