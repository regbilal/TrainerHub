using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Clients;

public class GetClientDetailQueryHandler : IRequestHandler<GetClientDetailQuery, ClientDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public GetClientDetailQueryHandler(IApplicationDbContext context, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _localizer = localizer;
    }

    public async Task<ClientDto> Handle(GetClientDetailQuery request, CancellationToken cancellationToken)
    {
        var client = await _context.Clients
            .FirstOrDefaultAsync(c => c.Id == request.ClientId && c.CoachId == request.CoachId, cancellationToken);

        if (client is null)
            throw new KeyNotFoundException(_localizer["ClientNotFound"]);

        return new ClientDto(
            client.Id,
            client.UserId,
            client.CoachId,
            client.FirstName,
            client.LastName,
            client.PhoneNumber,
            client.InvitationStatus.ToString(),
            client.InvitedAt,
            client.JoinedAt);
    }
}
