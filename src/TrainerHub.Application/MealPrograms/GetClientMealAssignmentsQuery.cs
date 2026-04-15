using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.MealPrograms;

public record GetClientMealAssignmentsQuery(Guid ClientId) : IRequest<List<MealProgramAssignmentDto>>;
