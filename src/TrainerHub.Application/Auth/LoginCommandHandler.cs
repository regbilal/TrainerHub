using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Auth;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public LoginCommandHandler(
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        IStringLocalizer<ErrorMessages> localizer)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _localizer = localizer;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var email = (request.Email ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(email))
            throw new UnauthorizedAccessException(_localizer["InvalidCredentials"]);

        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
            throw new UnauthorizedAccessException(_localizer["InvalidCredentials"]);

        var password = request.Password ?? string.Empty;
        if (!await _userManager.CheckPasswordAsync(user, password))
            throw new UnauthorizedAccessException(_localizer["InvalidCredentials"]);

        var token = _tokenService.GenerateToken(user);

        return new AuthResponse(token, new UserDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email ?? user.UserName ?? string.Empty,
            user.PhoneNumber ?? string.Empty,
            user.Role.ToString()));
    }
}
