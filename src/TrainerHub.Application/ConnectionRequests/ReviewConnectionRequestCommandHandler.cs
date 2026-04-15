using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Enums;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.ConnectionRequests;

public class ReviewConnectionRequestCommandHandler : IRequestHandler<ReviewConnectionRequestCommand, ConnectionRequestDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public ReviewConnectionRequestCommandHandler(IApplicationDbContext context, ITokenService tokenService, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _tokenService = tokenService;
        _localizer = localizer;
    }

    public async Task<ConnectionRequestDto> Handle(ReviewConnectionRequestCommand request, CancellationToken cancellationToken)
    {
        var connectionRequest = await _context.ConnectionRequests
            .Include(cr => cr.Coach)
            .FirstOrDefaultAsync(cr => cr.Id == request.RequestId && cr.CoachId == request.CoachId, cancellationToken)
            ?? throw new KeyNotFoundException(_localizer["ConnectionRequestNotFound"]);

        if (connectionRequest.Status != ConnectionRequestStatus.Pending)
            throw new InvalidOperationException(_localizer["RequestAlreadyReviewed"]);

        connectionRequest.Status = request.Accept
            ? ConnectionRequestStatus.Accepted
            : ConnectionRequestStatus.Rejected;
        connectionRequest.ReviewedAt = DateTime.UtcNow;

        if (request.Accept)
        {
            var client = new Client
            {
                Id = Guid.NewGuid(),
                CoachId = request.CoachId,
                FirstName = connectionRequest.FirstName,
                LastName = connectionRequest.LastName,
                PhoneNumber = connectionRequest.PhoneNumber,
                InvitationToken = _tokenService.GenerateInvitationToken(),
                InvitationStatus = InvitationStatus.Pending,
                InvitedAt = DateTime.UtcNow
            };

            _context.Clients.Add(client);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new ConnectionRequestDto(
            connectionRequest.Id,
            connectionRequest.CoachId,
            $"{connectionRequest.Coach.FirstName} {connectionRequest.Coach.LastName}",
            connectionRequest.FirstName,
            connectionRequest.LastName,
            connectionRequest.PhoneNumber,
            connectionRequest.Email,
            connectionRequest.Message,
            connectionRequest.Status.ToString(),
            connectionRequest.CreatedAt);
    }
}
