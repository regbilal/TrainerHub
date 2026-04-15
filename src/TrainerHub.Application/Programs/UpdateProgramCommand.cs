using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Programs;

public record UpdateProgramCommand(
    Guid ProgramId,
    string Name,
    string? Description,
    Guid CoachId,
    List<CreateExerciseDto> Exercises) : IRequest<TrainingProgramDto>;
