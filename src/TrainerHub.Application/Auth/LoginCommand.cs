using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Auth;

public record LoginCommand(string Email, string Password) : IRequest<AuthResponse>;
