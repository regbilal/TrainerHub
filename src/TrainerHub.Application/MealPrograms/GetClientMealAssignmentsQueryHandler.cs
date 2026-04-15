using MediatR;
using Microsoft.EntityFrameworkCore;
using TrainerHub.Application.DTOs;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.MealPrograms;

public class GetClientMealAssignmentsQueryHandler : IRequestHandler<GetClientMealAssignmentsQuery, List<MealProgramAssignmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetClientMealAssignmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MealProgramAssignmentDto>> Handle(GetClientMealAssignmentsQuery request, CancellationToken cancellationToken)
    {
        return await _context.MealProgramAssignments
            .Where(a => a.ClientId == request.ClientId)
            .Include(a => a.MealProgram)
                .ThenInclude(p => p.Days)
                    .ThenInclude(d => d.Items)
            .Select(a => new MealProgramAssignmentDto(
                a.Id,
                a.MealProgramId,
                a.ClientId,
                a.AssignedAt,
                a.Status.ToString(),
                new MealProgramDto(
                    a.MealProgram.Id,
                    a.MealProgram.CoachId,
                    a.MealProgram.Name,
                    a.MealProgram.Description,
                    a.MealProgram.Status.ToString(),
                    a.MealProgram.CreatedAt,
                    a.MealProgram.Days.OrderBy(d => d.Order).Select(d => new MealDayDto(
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
                    a.MealProgram.Assignments.Count)))
            .ToListAsync(cancellationToken);
    }
}
