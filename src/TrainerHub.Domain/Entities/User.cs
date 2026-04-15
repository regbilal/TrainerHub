using System.ComponentModel.DataAnnotations;
using TrainerHub.Domain.Enums;

namespace TrainerHub.Domain.Entities;

public class User
{
    public Guid Id { get; set; }

    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(32)]
    public string PhoneNumber { get; set; } = string.Empty;

    [MaxLength(512)]
    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Client> CoachClients { get; set; } = new List<Client>();

    public virtual ICollection<ConnectionRequest> ConnectionRequests { get; set; } = new List<ConnectionRequest>();

    public virtual Client? ClientProfile { get; set; }

    public virtual ICollection<Review> ReviewsWritten { get; set; } = new List<Review>();

    public virtual ICollection<Review> ReviewsReceived { get; set; } = new List<Review>();
}
