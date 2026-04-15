using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.MealPrograms;

public record CreateMealProgramCommand(
    string Name,
    string? Description,
    Guid CoachId,
    List<CreateMealDayDto> Days) : IRequest<MealProgramDto>;
