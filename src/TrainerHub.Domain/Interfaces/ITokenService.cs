using TrainerHub.Domain.Entities;

namespace TrainerHub.Domain.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);

    string GenerateInvitationToken();
}
