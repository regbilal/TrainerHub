using MediatR;
using Microsoft.EntityFrameworkCore;
using TrainerHub.Application.DTOs;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Programs;

public class GetCoachProgramsQueryHandler : IRequestHandler<GetCoachProgramsQuery, List<TrainingProgramDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCoachProgramsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TrainingProgramDto>> Handle(GetCoachProgramsQuery request, CancellationToken cancellationToken)
    {
        return await _context.TrainingPrograms
            .Where(p => p.CoachId == request.CoachId)
            .Include(p => p.Exercises)
            .Include(p => p.Assignments)
            .Select(p => new TrainingProgramDto(
                p.Id,
                p.CoachId,
                p.Name,
                p.Description,
                p.Status.ToString(),
                p.CreatedAt,
                p.Exercises.OrderBy(e => e.Order).Select(e => new ExerciseDto(
                    e.Id,
                    e.ProgramId,
                    e.Name,
                    e.Description,
                    e.Sets,
                    e.Reps,
                    e.DurationSeconds,
                    e.RestSeconds,
                    e.Order,
                    e.Notes)).ToList(),
                p.Assignments.Count))
            .ToListAsync(cancellationToken);
    }
}
