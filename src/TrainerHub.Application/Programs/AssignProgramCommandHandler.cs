using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Enums;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Programs;

public class AssignProgramCommandHandler : IRequestHandler<AssignProgramCommand, ProgramAssignmentDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public AssignProgramCommandHandler(IApplicationDbContext context, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _localizer = localizer;
    }

    public async Task<ProgramAssignmentDto> Handle(AssignProgramCommand request, CancellationToken cancellationToken)
    {
        var program = await _context.TrainingPrograms
            .FirstOrDefaultAsync(p => p.Id == request.ProgramId && p.CoachId == request.CoachId, cancellationToken);

        if (program is null)
            throw new KeyNotFoundException(_localizer["ProgramNotFound"]);

        var client = await _context.Clients
            .FirstOrDefaultAsync(c => c.Id == request.ClientId && c.CoachId == request.CoachId, cancellationToken);

        if (client is null)
            throw new KeyNotFoundException(_localizer["ClientNotFound"]);

        var assignment = new ProgramAssignment
        {
            Id = Guid.NewGuid(),
            ProgramId = request.ProgramId,
            ClientId = request.ClientId,
            AssignedAt = DateTime.UtcNow,
            Status = AssignmentStatus.Active
        };

        _context.ProgramAssignments.Add(assignment);
        await _context.SaveChangesAsync(cancellationToken);

        return new ProgramAssignmentDto(
            assignment.Id,
            assignment.ProgramId,
            assignment.ClientId,
            assignment.AssignedAt,
            assignment.Status.ToString(),
            null);
    }
}
