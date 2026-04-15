using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Enums;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.MealPrograms;

public class AssignMealProgramCommandHandler : IRequestHandler<AssignMealProgramCommand, MealProgramAssignmentDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public AssignMealProgramCommandHandler(IApplicationDbContext context, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _localizer = localizer;
    }

    public async Task<MealProgramAssignmentDto> Handle(AssignMealProgramCommand request, CancellationToken cancellationToken)
    {
        var program = await _context.MealPrograms
            .FirstOrDefaultAsync(p => p.Id == request.MealProgramId && p.CoachId == request.CoachId, cancellationToken);

        if (program is null)
            throw new KeyNotFoundException(_localizer["MealProgramNotFound"]);

        var client = await _context.Clients
            .FirstOrDefaultAsync(c => c.Id == request.ClientId && c.CoachId == request.CoachId, cancellationToken);

        if (client is null)
            throw new KeyNotFoundException(_localizer["ClientNotFound"]);

        var assignment = new MealProgramAssignment
        {
            Id = Guid.NewGuid(),
            MealProgramId = request.MealProgramId,
            ClientId = request.ClientId,
            AssignedAt = DateTime.UtcNow,
            Status = AssignmentStatus.Active
        };

        _context.MealProgramAssignments.Add(assignment);
        await _context.SaveChangesAsync(cancellationToken);

        return new MealProgramAssignmentDto(
            assignment.Id,
            assignment.MealProgramId,
            assignment.ClientId,
            assignment.AssignedAt,
            assignment.Status.ToString(),
            null);
    }
}
