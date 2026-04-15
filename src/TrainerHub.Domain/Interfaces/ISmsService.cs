namespace TrainerHub.Domain.Interfaces;

public interface ISmsService
{
    Task SendInvitationSmsAsync(string phoneNumber, string invitationLink);
}
