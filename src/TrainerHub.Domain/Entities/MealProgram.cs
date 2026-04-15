using System.ComponentModel.DataAnnotations;
using TrainerHub.Domain.Enums;

namespace TrainerHub.Domain.Entities;

public class MealProgram
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

    public virtual ApplicationUser Coach { get; set; } = null!;

    public virtual ICollection<MealDay> Days { get; set; } = new List<MealDay>();

    public virtual ICollection<MealProgramAssignment> Assignments { get; set; } = new List<MealProgramAssignment>();
}
