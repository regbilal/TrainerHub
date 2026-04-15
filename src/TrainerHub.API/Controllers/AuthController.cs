using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainerHub.Application.Auth;
using TrainerHub.Application.DTOs;

namespace TrainerHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await _mediator.Send(new LoginCommand(request.Email, request.Password));
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var result = await _mediator.Send(new RegisterCommand(
            request.FirstName, request.LastName, request.Email, request.Password, request.PhoneNumber));
        return Ok(result);
    }

    [HttpPost("onboarding")]
    public async Task<ActionResult<AuthResponse>> CompleteOnboarding([FromBody] CompleteOnboardingRequest request)
    {
        var result = await _mediator.Send(new CompleteOnboardingCommand(
            request.InvitationToken, request.Password, request.FirstName, request.LastName));
        return Ok(result);
    }
}
