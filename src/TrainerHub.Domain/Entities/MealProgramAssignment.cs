using TrainerHub.Domain.Enums;

namespace TrainerHub.Domain.Entities;

public class MealProgramAssignment
{
    public Guid Id { get; set; }

    public Guid MealProgramId { get; set; }

    public Guid ClientId { get; set; }

    public DateTime AssignedAt { get; set; }

    public AssignmentStatus Status { get; set; }

    public virtual MealProgram MealProgram { get; set; } = null!;

    public virtual Client Client { get; set; } = null!;
}
