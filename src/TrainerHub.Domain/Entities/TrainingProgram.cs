using System.ComponentModel.DataAnnotations;
using TrainerHub.Domain.Enums;

namespace TrainerHub.Domain.Entities;

public class TrainingProgram
{
    public Guid Id { get; set; }

    public Guid CoachId { get; set; }

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public ProgramStatus Status { get; set; }

    public virtual User Coach { get; set; } = null!;

    public virtual ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();

    public virtual ICollection<ProgramAssignment> Assignments { get; set; } = new List<ProgramAssignment>();
}
