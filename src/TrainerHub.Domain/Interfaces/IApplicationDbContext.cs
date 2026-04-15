using Microsoft.EntityFrameworkCore;
using TrainerHub.Domain.Entities;

namespace TrainerHub.Domain.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }

    DbSet<Client> Clients { get; }

    DbSet<TrainingProgram> TrainingPrograms { get; }

    DbSet<Exercise> Exercises { get; }

    DbSet<ProgramAssignment> ProgramAssignments { get; }

    DbSet<WorkoutLog> WorkoutLogs { get; }

    DbSet<ProgressEntry> ProgressEntries { get; }

    DbSet<ConnectionRequest> ConnectionRequests { get; }

    DbSet<Review> Reviews { get; }

    DbSet<MealProgram> MealPrograms { get; }

    DbSet<MealDay> MealDays { get; }

    DbSet<MealItem> MealItems { get; }

    DbSet<MealProgramAssignment> MealProgramAssignments { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
