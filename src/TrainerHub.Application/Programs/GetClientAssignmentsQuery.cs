using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Programs;

public record GetClientAssignmentsQuery(Guid ClientId) : IRequest<List<ProgramAssignmentDto>>;
