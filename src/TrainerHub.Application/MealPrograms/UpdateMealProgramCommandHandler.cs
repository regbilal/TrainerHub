using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.MealPrograms;

public class UpdateMealProgramCommandHandler : IRequestHandler<UpdateMealProgramCommand, MealProgramDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public UpdateMealProgramCommandHandler(IApplicationDbContext context, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _localizer = localizer;
    }

    public async Task<MealProgramDto> Handle(UpdateMealProgramCommand request, CancellationToken cancellationToken)
    {
        var program = await _context.MealPrograms
            .Include(p => p.Days)
                .ThenInclude(d => d.Items)
            .Include(p => p.Assignments)
            .FirstOrDefaultAsync(p => p.Id == request.MealProgramId && p.CoachId == request.CoachId, cancellationToken);

        if (program is null)
            throw new KeyNotFoundException(_localizer["MealProgramNotFound"]);

        program.Name = request.Name;
        program.Description = request.Description;
        program.UpdatedAt = DateTime.UtcNow;

        var oldItems = program.Days.SelectMany(d => d.Items).ToList();
        _context.MealItems.RemoveRange(oldItems);
        _context.MealDays.RemoveRange(program.Days);
        program.Days.Clear();

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

        await _context.SaveChangesAsync(cancellationToken);

        return CreateMealProgramCommandHandler.MapToDto(program);
    }
}
