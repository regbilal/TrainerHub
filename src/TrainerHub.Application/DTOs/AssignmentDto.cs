namespace TrainerHub.Application.DTOs;

public record ProgramAssignmentDto(
    Guid Id,
    Guid ProgramId,
    Guid ClientId,
    DateTime AssignedAt,
    string Status,
    TrainingProgramDto? Program);
