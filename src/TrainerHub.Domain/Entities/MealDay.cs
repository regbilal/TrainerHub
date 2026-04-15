using System.ComponentModel.DataAnnotations;

namespace TrainerHub.Domain.Entities;

public class MealDay
{
    public Guid Id { get; set; }

    public Guid MealProgramId { get; set; }

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public int Order { get; set; }

    public virtual MealProgram MealProgram { get; set; } = null!;

    public virtual ICollection<MealItem> Items { get; set; } = new List<MealItem>();
}
