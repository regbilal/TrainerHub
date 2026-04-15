using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Programs;

public class UpdateProgramCommandHandler : IRequestHandler<UpdateProgramCommand, TrainingProgramDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public UpdateProgramCommandHandler(IApplicationDbContext context, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _localizer = localizer;
    }

    public async Task<TrainingProgramDto> Handle(UpdateProgramCommand request, CancellationToken cancellationToken)
    {
        var program = await _context.TrainingPrograms
            .Include(p => p.Exercises)
            .Include(p => p.Assignments)
            .FirstOrDefaultAsync(p => p.Id == request.ProgramId && p.CoachId == request.CoachId, cancellationToken);

        if (program is null)
            throw new KeyNotFoundException(_localizer["ProgramNotFound"]);

        program.Name = request.Name;
        program.Description = request.Description;
        program.UpdatedAt = DateTime.UtcNow;

        _context.Exercises.RemoveRange(program.Exercises);

        foreach (var dto in request.Exercises)
        {
            program.Exercises.Add(new Exercise
            {
                Id = Guid.NewGuid(),
                ProgramId = program.Id,
                Name = dto.Name,
                Description = dto.Description,
                Sets = dto.Sets,
                Reps = dto.Reps,
                DurationSeconds = dto.DurationSeconds,
                RestSeconds = dto.RestSeconds,
                Order = dto.Order,
                Notes = dto.Notes
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new TrainingProgramDto(
            program.Id,
            program.CoachId,
            program.Name,
            program.Description,
            program.Status.ToString(),
            program.CreatedAt,
            program.Exercises.OrderBy(e => e.Order).Select(e => new ExerciseDto(
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
            program.Assignments.Count);
    }
}
