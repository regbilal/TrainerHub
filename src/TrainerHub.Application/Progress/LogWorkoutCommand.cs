using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Progress;

public record LogWorkoutCommand(
    Guid ClientId,
    Guid ProgramAssignmentId,
    Guid ExerciseId,
    int? SetsCompleted,
    int? RepsCompleted,
    decimal? WeightUsed,
    int? DurationSeconds,
    string? Notes) : IRequest<WorkoutLogDto>;
