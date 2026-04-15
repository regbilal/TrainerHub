using System.ComponentModel.DataAnnotations;

namespace TrainerHub.Domain.Entities;

public class Review
{
    public Guid Id { get; set; }

    public Guid ClientRelationshipId { get; set; }

    public Guid ReviewerUserId { get; set; }

    public Guid RevieweeUserId { get; set; }

    public int Rating { get; set; }

    [MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Client ClientRelationship { get; set; } = null!;

    public virtual User Reviewer { get; set; } = null!;

    public virtual User Reviewee { get; set; } = null!;
}
