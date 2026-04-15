using MediatR;
using Microsoft.EntityFrameworkCore;
using TrainerHub.Application.DTOs;
using TrainerHub.Domain.Enums;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.ConnectionRequests;

public class GetPendingRequestsQueryHandler : IRequestHandler<GetPendingRequestsQuery, List<ConnectionRequestDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPendingRequestsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<ConnectionRequestDto>> Handle(GetPendingRequestsQuery request, CancellationToken cancellationToken)
    {
        return await _context.ConnectionRequests
            .Include(cr => cr.Coach)
            .Where(cr => cr.CoachId == request.CoachId && cr.Status == ConnectionRequestStatus.Pending)
            .OrderByDescending(cr => cr.CreatedAt)
            .Select(cr => new ConnectionRequestDto(
                cr.Id,
                cr.CoachId,
                cr.Coach.FirstName + " " + cr.Coach.LastName,
                cr.FirstName,
                cr.LastName,
                cr.PhoneNumber,
                cr.Email,
                cr.Message,
                cr.Status.ToString(),
                cr.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
