using TrainerHub.Domain.Entities;

namespace TrainerHub.Domain.Interfaces;

public interface ITokenService
{
    string GenerateToken(ApplicationUser user);

    string GenerateInvitationToken();
}
