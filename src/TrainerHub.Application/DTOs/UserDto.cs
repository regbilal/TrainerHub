namespace TrainerHub.Application.DTOs;

public record UserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    string Role);
