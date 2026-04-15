using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Auth;

public record RegisterCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string? PhoneNumber) : IRequest<AuthResponse>;
