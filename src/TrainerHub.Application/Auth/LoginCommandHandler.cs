using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Auth;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public LoginCommandHandler(IApplicationDbContext context, ITokenService tokenService, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _tokenService = tokenService;
        _localizer = localizer;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException(_localizer["InvalidCredentials"]);

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
