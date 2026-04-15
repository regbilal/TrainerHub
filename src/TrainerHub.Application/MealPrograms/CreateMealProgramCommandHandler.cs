using MediatR;
using TrainerHub.Application.DTOs;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Enums;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.MealPrograms;

public class CreateMealProgramCommandHandler : IRequestHandler<CreateMealProgramCommand, MealProgramDto>
{
    private readonly IApplicationDbContext _context;

    public CreateMealProgramCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<MealProgramDto> Handle(CreateMealProgramCommand request, CancellationToken cancellationToken)
    {
        var program = new MealProgram
        {
            Id = Guid.NewGuid(),
            CoachId = request.CoachId,
            Name = request.Name,
            Description = request.Description,
            Status = ProgramStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var dayDto in request.Days)
        {
            var day = new MealDay
            {
                Id = Guid.NewGuid(),
                MealProgramId = program.Id,
                Title = dayDto.Title,
                Order = dayDto.Order
            };

            foreach (var itemDto in dayDto.Items)
            {
                day.Items.Add(new MealItem
                {
                    Id = Guid.NewGuid(),
                    MealDayId = day.Id,
                    Name = itemDto.Name,
                    Description = itemDto.Description,
                    Calories = itemDto.Calories,
                    ProteinGrams = itemDto.ProteinGrams,
                    CarbsGrams = itemDto.CarbsGrams,
                    FatGrams = itemDto.FatGrams,
                    Notes = itemDto.Notes,
                    Order = itemDto.Order
                });
            }

            program.Days.Add(day);
        }

        _context.MealPrograms.Add(program);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(program);
    }

    internal static MealProgramDto MapToDto(MealProgram p, int? assignmentCount = null)
    {
        return new MealProgramDto(
            p.Id,
            p.CoachId,
            p.Name,
            p.Description,
            p.Status.ToString(),
            p.CreatedAt,
            p.Days.OrderBy(d => d.Order).Select(d => new MealDayDto(
                d.Id,
                d.Title,
                d.Order,
                d.Items.OrderBy(i => i.Order).Select(i => new MealItemDto(
                    i.Id,
                    i.Name,
                    i.Description,
                    i.Calories,
                    i.ProteinGrams,
                    i.CarbsGrams,
                    i.FatGrams,
                    i.Notes,
                    i.Order)).ToList())).ToList(),
            assignmentCount ?? p.Assignments.Count);
    }
}
