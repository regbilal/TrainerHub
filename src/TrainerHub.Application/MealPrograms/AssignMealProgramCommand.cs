using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.MealPrograms;

public record AssignMealProgramCommand(Guid MealProgramId, Guid ClientId, Guid CoachId) : IRequest<MealProgramAssignmentDto>;
