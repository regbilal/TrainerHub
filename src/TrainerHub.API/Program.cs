using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TrainerHub.Domain.Entities;
using TrainerHub.Application;
using TrainerHub.Infrastructure;
using TrainerHub.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    await DatabaseSeeder.SeedAsync(db, userManager, logger);
}

app.UseCors("AllowAll");

if (!app.Environment.IsDevelopment())
{
    app.UseMiddleware<TrainerHub.API.Middleware.GlobalExceptionHandler>();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

var supportedCultures = new[] { "en", "ar", "fr", "es" };
app.UseRequestLocalization(options =>
{
    options.SetDefaultCulture("en")
           .AddSupportedCultures(supportedCultures)
           .AddSupportedUICultures(supportedCultures);
    options.ApplyCurrentCultureToResponseHeaders = true;
});

app.UseAuthentication();
app.UseAuthorization();

// Dev: browse http://localhost:5000 (Kestrel). Run `npm run dev` in trainer-hub-client (Vite on 5173).
// Must run before MapControllers so / and assets are proxied to Vite; /api and /swagger skip this branch.
if (app.Environment.IsDevelopment())
{
    app.UseWhen(
        context =>
            !context.Request.Path.StartsWithSegments("/api")
            && !context.Request.Path.StartsWithSegments("/swagger"),
        branch =>
        {
            branch.UseSpa(spa =>
            {
                spa.Options.SourcePath = "../trainer-hub-client";
                spa.UseProxyToSpaDevelopmentServer("http://localhost:5173");
            });
        });
}

app.MapControllers();

app.Run();
