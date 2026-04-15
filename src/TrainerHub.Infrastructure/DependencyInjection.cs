using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TrainerHub.Domain.Interfaces;
using TrainerHub.Infrastructure.Data;
using TrainerHub.Infrastructure.Services;

namespace TrainerHub.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration["ConnectionStrings:DefaultConnection"];

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<ISmsService, SmsService>();

        return services;
    }
}
