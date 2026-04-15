using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Progress;

public record GetClientWorkoutLogsQuery(Guid ClientId, Guid? AssignmentId) : IRequest<List<WorkoutLogDto>>;
