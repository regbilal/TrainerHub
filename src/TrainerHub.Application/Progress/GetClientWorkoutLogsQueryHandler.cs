using MediatR;
using Microsoft.EntityFrameworkCore;
using TrainerHub.Application.DTOs;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Progress;

public class GetClientWorkoutLogsQueryHandler : IRequestHandler<GetClientWorkoutLogsQuery, List<WorkoutLogDto>>
{
    private readonly IApplicationDbContext _context;

    public GetClientWorkoutLogsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WorkoutLogDto>> Handle(GetClientWorkoutLogsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.WorkoutLogs
            .Where(w => w.ClientId == request.ClientId);

        if (request.AssignmentId.HasValue)
            query = query.Where(w => w.ProgramAssignmentId == request.AssignmentId.Value);

        return await query
            .Include(w => w.Exercise)
            .OrderByDescending(w => w.CompletedAt)
            .Select(w => new WorkoutLogDto(
                w.Id,
                w.ClientId,
                w.ProgramAssignmentId,
                w.ExerciseId,
                w.CompletedAt,
                w.SetsCompleted,
                w.RepsCompleted,
                w.WeightUsed,
                w.DurationSeconds,
                w.Notes,
                new ExerciseDto(
                    w.Exercise.Id,
                    w.Exercise.ProgramId,
                    w.Exercise.Name,
                    w.Exercise.Description,
                    w.Exercise.Sets,
                    w.Exercise.Reps,
                    w.Exercise.DurationSeconds,
                    w.Exercise.RestSeconds,
                    w.Exercise.Order,
                    w.Exercise.Notes)))
            .ToListAsync(cancellationToken);
    }
}
