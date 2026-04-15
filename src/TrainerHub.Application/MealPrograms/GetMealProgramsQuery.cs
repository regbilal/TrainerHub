using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.MealPrograms;

public record GetMealProgramsQuery(Guid CoachId) : IRequest<List<MealProgramListDto>>;
