using TrainerHub.Domain.Enums;

namespace TrainerHub.Domain.Entities;

public class ProgramAssignment
{
    public Guid Id { get; set; }

    public Guid ProgramId { get; set; }

    public Guid ClientId { get; set; }

    public DateTime AssignedAt { get; set; }

    public AssignmentStatus Status { get; set; }

    public virtual TrainingProgram Program { get; set; } = null!;

    public virtual Client Client { get; set; } = null!;
}
