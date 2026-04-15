using System.ComponentModel.DataAnnotations;

namespace TrainerHub.Domain.Entities;

public class ProgressEntry
{
    public Guid Id { get; set; }

    public Guid ClientId { get; set; }

    public DateTime Date { get; set; }

    public decimal? Weight { get; set; }

    public decimal? BodyFatPercentage { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Client Client { get; set; } = null!;
}
