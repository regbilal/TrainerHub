using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Programs;

public record CreateProgramCommand(
    string Name,
    string? Description,
    Guid CoachId,
    List<CreateExerciseDto> Exercises) : IRequest<TrainingProgramDto>;
