using MediatR;
using Microsoft.EntityFrameworkCore;
using TrainerHub.Application.DTOs;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Clients;

public class GetCoachClientsQueryHandler : IRequestHandler<GetCoachClientsQuery, List<ClientDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCoachClientsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ClientDto>> Handle(GetCoachClientsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Clients
            .Where(c => c.CoachId == request.CoachId)
            .Select(c => new ClientDto(
                c.Id,
                c.UserId,
                c.CoachId,
                c.FirstName,
                c.LastName,
                c.PhoneNumber,
                c.InvitationStatus.ToString(),
                c.InvitedAt,
                c.JoinedAt))
            .ToListAsync(cancellationToken);
    }
}
