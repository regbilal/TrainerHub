using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Coaches;

public record SearchCoachesQuery(string? SearchTerm) : IRequest<List<CoachSearchResultDto>>;
