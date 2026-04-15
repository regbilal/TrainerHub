using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using TrainerHub.Application.DTOs;
using TrainerHub.Application.Resources;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Application.MealPrograms;

public class GetMealProgramDetailQueryHandler : IRequestHandler<GetMealProgramDetailQuery, MealProgramDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IStringLocalizer<ErrorMessages> _localizer;

    public GetMealProgramDetailQueryHandler(IApplicationDbContext context, IStringLocalizer<ErrorMessages> localizer)
    {
        _context = context;
        _localizer = localizer;
    }

    public async Task<MealProgramDto> Handle(GetMealProgramDetailQuery request, CancellationToken cancellationToken)
    {
        var program = await _context.MealPrograms
            .Include(p => p.Days)
                .ThenInclude(d => d.Items)
            .Include(p => p.Assignments)
            .FirstOrDefaultAsync(p => p.Id == request.MealProgramId && p.CoachId == request.CoachId, cancellationToken);

        if (program is null)
            throw new KeyNotFoundException(_localizer["MealProgramNotFound"]);

        return CreateMealProgramCommandHandler.MapToDto(program);
    }
}
