using MediatR;
using Microsoft.AspNetCore.Identity;
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
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public CompleteOnboardingCommandHandler(
        IApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _userManager = userManager;
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

        var syntheticEmail = $"{client.PhoneNumber}@trainerhub.app";
        var user = new ApplicationUser
        {
            UserName = syntheticEmail,
            Email = syntheticEmail,
            EmailConfirmed = true,
            FirstName = request.FirstName ?? client.FirstName,
            LastName = request.LastName ?? client.LastName,
            PhoneNumber = client.PhoneNumber,
            Role = UserRole.Client,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            var message = string.Join(" ", createResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException(string.IsNullOrWhiteSpace(message) ? _localizer["UnexpectedError"].Value : message);
        }

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
            user.Email ?? syntheticEmail,
            user.PhoneNumber ?? string.Empty,
            user.Role.ToString()));
    }
}
