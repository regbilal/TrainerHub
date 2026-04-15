using Microsoft.Extensions.Logging;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Infrastructure.Services;

public class SmsService : ISmsService
{
    private readonly ILogger<SmsService> _logger;

    public SmsService(ILogger<SmsService> logger)
    {
        _logger = logger;
    }

    public Task SendInvitationSmsAsync(string phoneNumber, string invitationLink)
    {
        _logger.LogInformation(
            "SMS (MVP stub): sending invitation to {PhoneNumber}. Link: {InvitationLink}",
            phoneNumber,
            invitationLink);

        return Task.CompletedTask;
    }
}
