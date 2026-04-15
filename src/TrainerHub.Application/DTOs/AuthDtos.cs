namespace TrainerHub.Application.DTOs;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string? PhoneNumber);

public record AuthResponse(string Token, UserDto User);

public record CompleteOnboardingRequest(
    string InvitationToken,
    string Password,
    string? FirstName,
    string? LastName);
