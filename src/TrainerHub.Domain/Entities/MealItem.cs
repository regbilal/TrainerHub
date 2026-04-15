using System.ComponentModel.DataAnnotations;

namespace TrainerHub.Domain.Entities;

public class MealItem
{
    public Guid Id { get; set; }

    public Guid MealDayId { get; set; }

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public int? Calories { get; set; }

    public decimal? ProteinGrams { get; set; }

    public decimal? CarbsGrams { get; set; }

    public decimal? FatGrams { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }

    public int Order { get; set; }

    public virtual MealDay MealDay { get; set; } = null!;
}
