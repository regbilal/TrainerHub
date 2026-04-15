using MediatR;
using TrainerHub.Application.DTOs;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Progress;

public class AddProgressEntryCommandHandler : IRequestHandler<AddProgressEntryCommand, ProgressEntryDto>
{
    private readonly IApplicationDbContext _context;

    public AddProgressEntryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProgressEntryDto> Handle(AddProgressEntryCommand request, CancellationToken cancellationToken)
    {
        var entry = new ProgressEntry
        {
            Id = Guid.NewGuid(),
            ClientId = request.ClientId,
            Date = DateTime.UtcNow,
            Weight = request.Weight,
            BodyFatPercentage = request.BodyFatPercentage,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _context.ProgressEntries.Add(entry);
        await _context.SaveChangesAsync(cancellationToken);

        return new ProgressEntryDto(
            entry.Id,
            entry.ClientId,
            entry.Date,
            entry.Weight,
            entry.BodyFatPercentage,
            entry.Notes,
            entry.CreatedAt);
    }
}
