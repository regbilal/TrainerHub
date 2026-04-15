using System.ComponentModel.DataAnnotations;

namespace TrainerHub.Domain.Entities;

public class WorkoutLog
{
    public Guid Id { get; set; }

    public Guid ClientId { get; set; }

    public Guid ProgramAssignmentId { get; set; }

    public Guid ExerciseId { get; set; }

    public DateTime CompletedAt { get; set; }

    public int? SetsCompleted { get; set; }

    public int? RepsCompleted { get; set; }

    public decimal? WeightUsed { get; set; }

    public int? DurationSeconds { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }

    public virtual Client Client { get; set; } = null!;

    public virtual ProgramAssignment ProgramAssignment { get; set; } = null!;

    public virtual Exercise Exercise { get; set; } = null!;
}
