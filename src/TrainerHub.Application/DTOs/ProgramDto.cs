namespace TrainerHub.Application.DTOs;

public record TrainingProgramDto(
    Guid Id,
    Guid CoachId,
    string Name,
    string? Description,
    string Status,
    DateTime CreatedAt,
    List<ExerciseDto> Exercises,
    int AssignmentCount);

public record ExerciseDto(
    Guid Id,
    Guid ProgramId,
    string Name,
    string? Description,
    int? Sets,
    int? Reps,
    int? DurationSeconds,
    int? RestSeconds,
    int Order,
    string? Notes);

public record CreateExerciseDto(
    string Name,
    string? Description,
    int? Sets,
    int? Reps,
    int? DurationSeconds,
    int? RestSeconds,
    int Order,
    string? Notes);
