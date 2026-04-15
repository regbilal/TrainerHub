using MediatR;
using Microsoft.EntityFrameworkCore;
using TrainerHub.Application.DTOs;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Progress;

public class GetClientProgressQueryHandler : IRequestHandler<GetClientProgressQuery, List<ProgressEntryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetClientProgressQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProgressEntryDto>> Handle(GetClientProgressQuery request, CancellationToken cancellationToken)
    {
        return await _context.ProgressEntries
            .Where(p => p.ClientId == request.ClientId)
            .OrderByDescending(p => p.Date)
            .Select(p => new ProgressEntryDto(
                p.Id,
                p.ClientId,
                p.Date,
                p.Weight,
                p.BodyFatPercentage,
                p.Notes,
                p.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
