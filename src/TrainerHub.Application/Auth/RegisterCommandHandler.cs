using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Enums;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.Auth;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public RegisterCommandHandler(IApplicationDbContext context, ITokenService tokenService, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _tokenService = tokenService;
        _localizer = localizer;
    }

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _context.Users
            .AnyAsync(u => u.Email == request.Email, cancellationToken);

        if (existingUser)
            throw new InvalidOperationException(_localizer["EmailAlreadyExists"]);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber ?? string.Empty,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Coach,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
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
