using Microsoft.EntityFrameworkCore;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Interfaces;

namespace TrainerHub.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Client> Clients => Set<Client>();

    public DbSet<TrainingProgram> TrainingPrograms => Set<TrainingProgram>();

    public DbSet<Exercise> Exercises => Set<Exercise>();

    public DbSet<ProgramAssignment> ProgramAssignments => Set<ProgramAssignment>();

    public DbSet<WorkoutLog> WorkoutLogs => Set<WorkoutLog>();

    public DbSet<ProgressEntry> ProgressEntries => Set<ProgressEntry>();

    public DbSet<ConnectionRequest> ConnectionRequests => Set<ConnectionRequest>();

    public DbSet<Review> Reviews => Set<Review>();

    public DbSet<MealProgram> MealPrograms => Set<MealProgram>();

    public DbSet<MealDay> MealDays => Set<MealDay>();

    public DbSet<MealItem> MealItems => Set<MealItem>();

    public DbSet<MealProgramAssignment> MealProgramAssignments => Set<MealProgramAssignment>();

    public DbSet<ErrorLog> ErrorLogs => Set<ErrorLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();

            entity.HasMany(e => e.CoachClients)
                .WithOne(e => e.Coach)
                .HasForeignKey(e => e.CoachId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ClientProfile)
                .WithOne(e => e.User)
                .HasForeignKey<Client>(e => e.UserId);
        });

        modelBuilder.Entity<ConnectionRequest>(entity =>
        {
            entity.HasOne(e => e.Coach)
                .WithMany(e => e.ConnectionRequests)
                .HasForeignKey(e => e.CoachId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.CoachId);
            entity.HasIndex(e => new { e.CoachId, e.PhoneNumber, e.Status });
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasOne(e => e.ClientRelationship)
                .WithMany(e => e.Reviews)
                .HasForeignKey(e => e.ClientRelationshipId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Reviewer)
                .WithMany(e => e.ReviewsWritten)
                .HasForeignKey(e => e.ReviewerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Reviewee)
                .WithMany(e => e.ReviewsReceived)
                .HasForeignKey(e => e.RevieweeUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.ClientRelationshipId, e.ReviewerUserId }).IsUnique();
            entity.HasIndex(e => e.RevieweeUserId);
        });

        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasIndex(e => e.InvitationToken).IsUnique();
            entity.HasIndex(e => e.PhoneNumber);
        });

        modelBuilder.Entity<TrainingProgram>(entity =>
        {
            entity.HasOne(e => e.Coach)
                .WithMany()
                .HasForeignKey(e => e.CoachId);
        });

        modelBuilder.Entity<Exercise>(entity =>
        {
            entity.HasOne(e => e.Program)
                .WithMany(e => e.Exercises)
                .HasForeignKey(e => e.ProgramId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.ProgramId, e.Order });
        });

        modelBuilder.Entity<ProgramAssignment>(entity =>
        {
            entity.HasOne(e => e.Program)
                .WithMany(e => e.Assignments)
                .HasForeignKey(e => e.ProgramId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Client)
                .WithMany(e => e.ProgramAssignments)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<WorkoutLog>(entity =>
        {
            entity.HasOne(e => e.Client)
                .WithMany(e => e.WorkoutLogs)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ProgramAssignment)
                .WithMany()
                .HasForeignKey(e => e.ProgramAssignmentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Exercise)
                .WithMany()
                .HasForeignKey(e => e.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.WeightUsed).HasPrecision(10, 2);
        });

        modelBuilder.Entity<ProgressEntry>(entity =>
        {
            entity.HasOne(e => e.Client)
                .WithMany(e => e.ProgressEntries)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(e => e.Weight).HasPrecision(10, 2);
            entity.Property(e => e.BodyFatPercentage).HasPrecision(5, 2);
        });

        modelBuilder.Entity<MealProgram>(entity =>
        {
            entity.HasOne(e => e.Coach)
                .WithMany()
                .HasForeignKey(e => e.CoachId);
        });

        modelBuilder.Entity<MealDay>(entity =>
        {
            entity.HasOne(e => e.MealProgram)
                .WithMany(e => e.Days)
                .HasForeignKey(e => e.MealProgramId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.MealProgramId, e.Order });
        });

        modelBuilder.Entity<MealItem>(entity =>
        {
            entity.HasOne(e => e.MealDay)
                .WithMany(e => e.Items)
                .HasForeignKey(e => e.MealDayId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.MealDayId, e.Order });

            entity.Property(e => e.ProteinGrams).HasPrecision(8, 2);
            entity.Property(e => e.CarbsGrams).HasPrecision(8, 2);
            entity.Property(e => e.FatGrams).HasPrecision(8, 2);
        });

        modelBuilder.Entity<MealProgramAssignment>(entity =>
        {
            entity.HasOne(e => e.MealProgram)
                .WithMany(e => e.Assignments)
                .HasForeignKey(e => e.MealProgramId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Client)
                .WithMany(e => e.MealProgramAssignments)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
