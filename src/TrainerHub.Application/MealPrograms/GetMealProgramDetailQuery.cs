using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.MealPrograms;

public record GetMealProgramDetailQuery(Guid MealProgramId, Guid CoachId) : IRequest<MealProgramDto>;
