using MediatR;
using Microsoft.EntityFrameworkCore;
using TrainerHub.Application.DTOs;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Programs;

public class GetClientAssignmentsQueryHandler : IRequestHandler<GetClientAssignmentsQuery, List<ProgramAssignmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetClientAssignmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProgramAssignmentDto>> Handle(GetClientAssignmentsQuery request, CancellationToken cancellationToken)
    {
        return await _context.ProgramAssignments
            .Where(a => a.ClientId == request.ClientId)
            .Include(a => a.Program)
                .ThenInclude(p => p.Exercises)
            .Select(a => new ProgramAssignmentDto(
                a.Id,
                a.ProgramId,
                a.ClientId,
                a.AssignedAt,
                a.Status.ToString(),
                new TrainingProgramDto(
                    a.Program.Id,
                    a.Program.CoachId,
                    a.Program.Name,
                    a.Program.Description,
                    a.Program.Status.ToString(),
                    a.Program.CreatedAt,
                    a.Program.Exercises.OrderBy(e => e.Order).Select(e => new ExerciseDto(
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
                    a.Program.Assignments.Count)))
            .ToListAsync(cancellationToken);
    }
}
