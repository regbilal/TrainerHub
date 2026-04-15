using MediatR;
using TrainerHub.Application.DTOs;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Enums;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Clients;

public class InviteClientCommandHandler : IRequestHandler<InviteClientCommand, ClientDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly ISmsService _smsService;

    public InviteClientCommandHandler(
        IApplicationDbContext context,
        ITokenService tokenService,
        ISmsService smsService)
    {
        _context = context;
        _tokenService = tokenService;
        _smsService = smsService;
    }

    public async Task<ClientDto> Handle(InviteClientCommand request, CancellationToken cancellationToken)
    {
        var invitationToken = _tokenService.GenerateInvitationToken();

        var client = new Client
        {
            Id = Guid.NewGuid(),
            CoachId = request.CoachId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            InvitationToken = invitationToken,
            InvitationStatus = InvitationStatus.Pending,
            InvitedAt = DateTime.UtcNow
        };

        _context.Clients.Add(client);
        await _context.SaveChangesAsync(cancellationToken);

        await _smsService.SendInvitationSmsAsync(client.PhoneNumber, invitationToken);

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
