using System.ComponentModel.DataAnnotations;

namespace TrainerHub.Domain.Entities;

public class Exercise
{
    public Guid Id { get; set; }

    public Guid ProgramId { get; set; }

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public int? Sets { get; set; }

    public int? Reps { get; set; }

    public int? DurationSeconds { get; set; }

    public int? RestSeconds { get; set; }

    public int Order { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }

    public virtual TrainingProgram Program { get; set; } = null!;
}
