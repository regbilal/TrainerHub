using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Progress;

public class LogWorkoutCommandHandler : IRequestHandler<LogWorkoutCommand, WorkoutLogDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public LogWorkoutCommandHandler(IApplicationDbContext context, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _localizer = localizer;
    }

    public async Task<WorkoutLogDto> Handle(LogWorkoutCommand request, CancellationToken cancellationToken)
    {
        var assignment = await _context.ProgramAssignments
            .FirstOrDefaultAsync(a => a.Id == request.ProgramAssignmentId && a.ClientId == request.ClientId, cancellationToken);

        if (assignment is null)
            throw new KeyNotFoundException(_localizer["AssignmentNotFound"]);

        var exercise = await _context.Exercises
            .FirstOrDefaultAsync(e => e.Id == request.ExerciseId, cancellationToken);

        if (exercise is null)
            throw new KeyNotFoundException(_localizer["ExerciseNotFound"]);

        var log = new WorkoutLog
        {
            Id = Guid.NewGuid(),
            ClientId = request.ClientId,
            ProgramAssignmentId = request.ProgramAssignmentId,
            ExerciseId = request.ExerciseId,
            CompletedAt = DateTime.UtcNow,
            SetsCompleted = request.SetsCompleted,
            RepsCompleted = request.RepsCompleted,
            WeightUsed = request.WeightUsed,
            DurationSeconds = request.DurationSeconds,
            Notes = request.Notes
        };

        _context.WorkoutLogs.Add(log);
        await _context.SaveChangesAsync(cancellationToken);

        return new WorkoutLogDto(
            log.Id,
            log.ClientId,
            log.ProgramAssignmentId,
            log.ExerciseId,
            log.CompletedAt,
            log.SetsCompleted,
            log.RepsCompleted,
            log.WeightUsed,
            log.DurationSeconds,
            log.Notes,
            new ExerciseDto(
                exercise.Id,
                exercise.ProgramId,
                exercise.Name,
                exercise.Description,
                exercise.Sets,
                exercise.Reps,
                exercise.DurationSeconds,
                exercise.RestSeconds,
                exercise.Order,
                exercise.Notes));
    }
}
