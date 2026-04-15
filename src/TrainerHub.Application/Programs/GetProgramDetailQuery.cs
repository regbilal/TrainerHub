using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Programs;

public record GetProgramDetailQuery(Guid ProgramId) : IRequest<TrainingProgramDto>;
