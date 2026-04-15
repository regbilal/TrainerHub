using System.ComponentModel.DataAnnotations;
using TrainerHub.Domain.Enums;

namespace TrainerHub.Domain.Entities;

public class ConnectionRequest
{
    public Guid Id { get; set; }

    public Guid CoachId { get; set; }

    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(32)]
    public string PhoneNumber { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? Email { get; set; }

    [MaxLength(500)]
    public string? Message { get; set; }

    public ConnectionRequestStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public virtual ApplicationUser Coach { get; set; } = null!;
}
