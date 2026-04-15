using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Programs;

public record GetCoachProgramsQuery(Guid CoachId) : IRequest<List<TrainingProgramDto>>;
