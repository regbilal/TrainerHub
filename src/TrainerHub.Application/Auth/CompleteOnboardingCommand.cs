using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Auth;

public record CompleteOnboardingCommand(
    string InvitationToken,
    string Password,
    string? FirstName,
    string? LastName) : IRequest<AuthResponse>;
