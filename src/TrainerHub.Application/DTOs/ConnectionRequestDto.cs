namespace TrainerHub.Application.DTOs;

public record ConnectionRequestDto(
    Guid Id,
    Guid CoachId,
    string CoachName,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string? Email,
    string? Message,
    string Status,
    DateTime CreatedAt);

public record CoachSearchResultDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    double? AverageRating,
    int ReviewCount);

public record CreateConnectionRequestDto(
    Guid CoachId,
    string FirstName,
    string LastName,
    string PhoneNumber,
    string? Email,
    string? Message);
