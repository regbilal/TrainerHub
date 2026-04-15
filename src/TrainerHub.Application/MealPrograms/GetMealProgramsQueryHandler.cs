using MediatR;
using Microsoft.EntityFrameworkCore;
using TrainerHub.Application.DTOs;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.MealPrograms;

public class GetMealProgramsQueryHandler : IRequestHandler<GetMealProgramsQuery, List<MealProgramListDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMealProgramsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MealProgramListDto>> Handle(GetMealProgramsQuery request, CancellationToken cancellationToken)
    {
        return await _context.MealPrograms
            .Where(p => p.CoachId == request.CoachId)
            .Select(p => new MealProgramListDto(
                p.Id,
                p.Name,
                p.Description,
                p.Status.ToString(),
                p.CreatedAt,
                p.Days.Count,
                p.Assignments.Count))
            .ToListAsync(cancellationToken);
    }
}
