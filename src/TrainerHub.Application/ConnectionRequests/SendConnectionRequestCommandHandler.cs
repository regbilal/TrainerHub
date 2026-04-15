using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Enums;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.ConnectionRequests;

public class SendConnectionRequestCommandHandler : IRequestHandler<SendConnectionRequestCommand, ConnectionRequestDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public SendConnectionRequestCommandHandler(IApplicationDbContext context, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _localizer = localizer;
    }

    public async Task<ConnectionRequestDto> Handle(SendConnectionRequestCommand request, CancellationToken cancellationToken)
    {
        var coach = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.CoachId && u.Role == UserRole.Coach, cancellationToken)
            ?? throw new KeyNotFoundException(_localizer["CoachNotFound"]);

        var existing = await _context.ConnectionRequests
            .AnyAsync(cr =>
                cr.CoachId == request.CoachId &&
                cr.PhoneNumber == request.PhoneNumber &&
                cr.Status == ConnectionRequestStatus.Pending,
                cancellationToken);

        if (existing)
            throw new InvalidOperationException(_localizer["PendingRequestExists"]);

        var connectionRequest = new ConnectionRequest
        {
            Id = Guid.NewGuid(),
            CoachId = request.CoachId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Email = request.Email,
            Message = request.Message,
            Status = ConnectionRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.ConnectionRequests.Add(connectionRequest);
        await _context.SaveChangesAsync(cancellationToken);

        return new ConnectionRequestDto(
            connectionRequest.Id,
            connectionRequest.CoachId,
            $"{coach.FirstName} {coach.LastName}",
            connectionRequest.FirstName,
            connectionRequest.LastName,
            connectionRequest.PhoneNumber,
            connectionRequest.Email,
            connectionRequest.Message,
            connectionRequest.Status.ToString(),
            connectionRequest.CreatedAt);
    }
}
