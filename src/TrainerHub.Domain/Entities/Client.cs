using System.ComponentModel.DataAnnotations;
using TrainerHub.Domain.Enums;

namespace TrainerHub.Domain.Entities;

public class Client
{
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }

    public Guid CoachId { get; set; }

    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(32)]
    public string PhoneNumber { get; set; } = string.Empty;

    [MaxLength(128)]
    public string InvitationToken { get; set; } = string.Empty;

    public InvitationStatus InvitationStatus { get; set; }

    public DateTime InvitedAt { get; set; }

    public DateTime? JoinedAt { get; set; }

    public virtual ApplicationUser? User { get; set; }

    public virtual ApplicationUser Coach { get; set; } = null!;

    public virtual ICollection<ProgramAssignment> ProgramAssignments { get; set; } = new List<ProgramAssignment>();

    public virtual ICollection<ProgressEntry> ProgressEntries { get; set; } = new List<ProgressEntry>();

    public virtual ICollection<WorkoutLog> WorkoutLogs { get; set; } = new List<WorkoutLog>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<MealProgramAssignment> MealProgramAssignments { get; set; } = new List<MealProgramAssignment>();
}
