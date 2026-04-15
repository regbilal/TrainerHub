namespace TrainerHub.Application.DTOs;

public record ProgressEntryDto(
    Guid Id,
    Guid ClientId,
    DateTime Date,
    decimal? Weight,
    decimal? BodyFatPercentage,
    string? Notes,
    DateTime CreatedAt);

public record WorkoutLogDto(
    Guid Id,
    Guid ClientId,
    Guid ProgramAssignmentId,
    Guid ExerciseId,
    DateTime CompletedAt,
    int? SetsCompleted,
    int? RepsCompleted,
    decimal? WeightUsed,
    int? DurationSeconds,
    string? Notes,
    ExerciseDto? Exercise);
