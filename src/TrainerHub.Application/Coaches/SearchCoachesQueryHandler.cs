using MediatR;
using Microsoft.EntityFrameworkCore;
using TrainerHub.Application.DTOs;
using TrainerHub.Domain.Enums;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Coaches;

public class SearchCoachesQueryHandler : IRequestHandler<SearchCoachesQuery, List<CoachSearchResultDto>>
{
    private readonly IApplicationDbContext _context;

    public SearchCoachesQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<CoachSearchResultDto>> Handle(SearchCoachesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Users
            .Where(u => u.Role == UserRole.Coach);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.Trim().ToLower();
            query = query.Where(u =>
                u.FirstName.ToLower().Contains(term) ||
                u.LastName.ToLower().Contains(term) ||
                (u.Email != null && u.Email.ToLower().Contains(term)));
        }

        return await query
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .Take(50)
            .Select(u => new CoachSearchResultDto(
                u.Id,
                u.FirstName,
                u.LastName,
                u.Email ?? string.Empty,
                u.ReviewsReceived.Any() ? (double?)u.ReviewsReceived.Average(r => r.Rating) : null,
                u.ReviewsReceived.Count))
            .ToListAsync(cancellationToken);
    }
}
