namespace TrainerHub.Application.DTOs;

public record MealProgramDto(
    Guid Id,
    Guid CoachId,
    string Name,
    string? Description,
    string Status,
    DateTime CreatedAt,
    List<MealDayDto> Days,
    int AssignmentCount);

public record MealProgramListDto(
    Guid Id,
    string Name,
    string? Description,
    string Status,
    DateTime CreatedAt,
    int DayCount,
    int AssignmentCount);

public record MealDayDto(
    Guid Id,
    string Title,
    int Order,
    List<MealItemDto> Items);

public record MealItemDto(
    Guid Id,
    string Name,
    string? Description,
    int? Calories,
    decimal? ProteinGrams,
    decimal? CarbsGrams,
    decimal? FatGrams,
    string? Notes,
    int Order);

public record CreateMealProgramDto(
    string Name,
    string? Description,
    List<CreateMealDayDto> Days);

public record CreateMealDayDto(
    string Title,
    int Order,
    List<CreateMealItemDto> Items);

public record CreateMealItemDto(
    string Name,
    string? Description,
    int? Calories,
    decimal? ProteinGrams,
    decimal? CarbsGrams,
    decimal? FatGrams,
    string? Notes,
    int Order);

public record AssignMealProgramDto(
    Guid MealProgramId,
    Guid ClientId);

public record MealProgramAssignmentDto(
    Guid Id,
    Guid MealProgramId,
    Guid ClientId,
    DateTime AssignedAt,
    string Status,
    MealProgramDto? MealProgram);
