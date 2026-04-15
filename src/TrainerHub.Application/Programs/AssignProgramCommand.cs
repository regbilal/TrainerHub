using MediatR;
using TrainerHub.Application.DTOs;

namespace TrainerHub.Application.Programs;

public record AssignProgramCommand(Guid ProgramId, Guid ClientId, Guid CoachId) : IRequest<ProgramAssignmentDto>;
