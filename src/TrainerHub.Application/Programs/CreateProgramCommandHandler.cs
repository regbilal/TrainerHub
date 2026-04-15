using MediatR;
using TrainerHub.Application.DTOs;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Enums;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Programs;

public class CreateProgramCommandHandler : IRequestHandler<CreateProgramCommand, TrainingProgramDto>
{
    private readonly IApplicationDbContext _context;

    public CreateProgramCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TrainingProgramDto> Handle(CreateProgramCommand request, CancellationToken cancellationToken)
    {
        var program = new TrainingProgram
        {
            Id = Guid.NewGuid(),
            CoachId = request.CoachId,
            Name = request.Name,
            Description = request.Description,
            Status = ProgramStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

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

        _context.TrainingPrograms.Add(program);
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
            0);
    }
}
