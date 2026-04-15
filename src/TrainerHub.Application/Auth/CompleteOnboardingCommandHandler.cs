using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Enums;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Auth;

public class CompleteOnboardingCommandHandler : IRequestHandler<CompleteOnboardingCommand, AuthResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public CompleteOnboardingCommandHandler(IApplicationDbContext context, ITokenService tokenService, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _tokenService = tokenService;
        _localizer = localizer;
    }

    public async Task<AuthResponse> Handle(CompleteOnboardingCommand request, CancellationToken cancellationToken)
    {
        var client = await _context.Clients
            .FirstOrDefaultAsync(c => c.InvitationToken == request.InvitationToken, cancellationToken);

        if (client is null)
            throw new KeyNotFoundException(_localizer["InvalidInvitationToken"]);

        if (client.InvitationStatus != InvitationStatus.Pending)
            throw new InvalidOperationException(_localizer["InvitationAlreadyUsed"]);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName ?? client.FirstName,
            LastName = request.LastName ?? client.LastName,
            Email = $"{client.PhoneNumber}@trainerhub.app",
            PhoneNumber = client.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Client,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        client.UserId = user.Id;
        client.InvitationStatus = InvitationStatus.Accepted;
        client.JoinedAt = DateTime.UtcNow;

        if (request.FirstName is not null)
            client.FirstName = request.FirstName;
        if (request.LastName is not null)
            client.LastName = request.LastName;

        await _context.SaveChangesAsync(cancellationToken);

        var token = _tokenService.GenerateToken(user);

        return new AuthResponse(token, new UserDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.PhoneNumber,
            user.Role.ToString()));
    }
}
