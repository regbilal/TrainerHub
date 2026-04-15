namespace TrainerHub.Application.DTOs;

public record ClientDto(
    Guid Id,
    Guid? UserId,
    Guid CoachId,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string InvitationStatus,
    DateTime InvitedAt,
    DateTime? JoinedAt);
