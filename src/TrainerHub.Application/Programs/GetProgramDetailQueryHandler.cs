using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Programs;

public class GetProgramDetailQueryHandler : IRequestHandler<GetProgramDetailQuery, TrainingProgramDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public GetProgramDetailQueryHandler(IApplicationDbContext context, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _localizer = localizer;
    }

    public async Task<TrainingProgramDto> Handle(GetProgramDetailQuery request, CancellationToken cancellationToken)
    {
        var program = await _context.TrainingPrograms
            .Include(p => p.Exercises)
            .Include(p => p.Assignments)
            .FirstOrDefaultAsync(p => p.Id == request.ProgramId, cancellationToken);

        if (program is null)
            throw new KeyNotFoundException(_localizer["ProgramNotFound"]);

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
