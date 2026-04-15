using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TrainerHub.Domain.Entities;
using TrainerHub.Domain.Enums;

namespace TrainerHub.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager, ILogger logger)
    {
        if (await context.Users.AnyAsync())
        {
            logger.LogInformation("Database already seeded — skipping.");
            return;
        }

        logger.LogInformation("Seeding database with test data...");

        var now = DateTime.UtcNow;

        // ── Users (ASP.NET Core Identity) ──────────────────────────
        var coach1 = await SeedUserAsync(userManager, "coach@test.com", "Ahmed", "Benali", "+212600000001", UserRole.Coach, now.AddMonths(-3));
        var coach2 = await SeedUserAsync(userManager, "sara.coach@test.com", "Sara", "Martinez", "+212600000002", UserRole.Coach, now.AddMonths(-2));
        var clientUser1 = await SeedUserAsync(userManager, "client@test.com", "Youssef", "Alami", "+212600000003", UserRole.Client, now.AddMonths(-2));
        var clientUser2 = await SeedUserAsync(userManager, "fatima@test.com", "Fatima", "Zahra", "+212600000004", UserRole.Client, now.AddMonths(-1));
        var clientUser3 = await SeedUserAsync(userManager, "omar@test.com", "Omar", "Idrissi", "+212600000005", UserRole.Client, now.AddDays(7 * -3));
        var coach3 = await SeedUserAsync(userManager, "khaled.coach@test.com", "خالد", "العمري", "+966500000001", UserRole.Coach, now.AddMonths(-4));
        var clientUser4 = await SeedUserAsync(userManager, "mohammed@test.com", "محمد", "الشهري", "+966500000002", UserRole.Client, now.AddMonths(-3));
        var clientUser5 = await SeedUserAsync(userManager, "noura@test.com", "نورة", "القحطاني", "+966500000003", UserRole.Client, now.AddMonths(-2));

        // ── Clients (coach-client relationships) ───────────────────
        var client1 = new Client
        {
            Id = Guid.NewGuid(),
            UserId = clientUser1.Id,
            CoachId = coach1.Id,
            FirstName = clientUser1.FirstName,
            LastName = clientUser1.LastName,
            PhoneNumber = clientUser1.PhoneNumber ?? string.Empty,
            InvitationToken = Guid.NewGuid().ToString("N"),
            InvitationStatus = InvitationStatus.Accepted,
            InvitedAt = now.AddMonths(-2),
            JoinedAt = now.AddMonths(-2).AddDays(1)
        };

        var client2 = new Client
        {
            Id = Guid.NewGuid(),
            UserId = clientUser2.Id,
            CoachId = coach1.Id,
            FirstName = clientUser2.FirstName,
            LastName = clientUser2.LastName,
            PhoneNumber = clientUser2.PhoneNumber ?? string.Empty,
            InvitationToken = Guid.NewGuid().ToString("N"),
            InvitationStatus = InvitationStatus.Accepted,
            InvitedAt = now.AddMonths(-1),
            JoinedAt = now.AddMonths(-1).AddDays(2)
        };

        var client3 = new Client
        {
            Id = Guid.NewGuid(),
            UserId = clientUser3.Id,
            CoachId = coach2.Id,
            FirstName = clientUser3.FirstName,
            LastName = clientUser3.LastName,
            PhoneNumber = clientUser3.PhoneNumber ?? string.Empty,
            InvitationToken = Guid.NewGuid().ToString("N"),
            InvitationStatus = InvitationStatus.Accepted,
            InvitedAt = now.AddDays(7 *-3),
            JoinedAt = now.AddDays(7 *-3).AddDays(1)
        };

        var pendingClient = new Client
        {
            Id = Guid.NewGuid(),
            UserId = null,
            CoachId = coach1.Id,
            FirstName = "Karim",
            LastName = "Tazi",
            PhoneNumber = "+212600000006",
            InvitationToken = Guid.NewGuid().ToString("N"),
            InvitationStatus = InvitationStatus.Pending,
            InvitedAt = now.AddDays(-3)
        };

        var client4 = new Client
        {
            Id = Guid.NewGuid(),
            UserId = clientUser4.Id,
            CoachId = coach3.Id,
            FirstName = clientUser4.FirstName,
            LastName = clientUser4.LastName,
            PhoneNumber = clientUser4.PhoneNumber ?? string.Empty,
            InvitationToken = Guid.NewGuid().ToString("N"),
            InvitationStatus = InvitationStatus.Accepted,
            InvitedAt = now.AddMonths(-3),
            JoinedAt = now.AddMonths(-3).AddDays(1)
        };

        var client5 = new Client
        {
            Id = Guid.NewGuid(),
            UserId = clientUser5.Id,
            CoachId = coach3.Id,
            FirstName = clientUser5.FirstName,
            LastName = clientUser5.LastName,
            PhoneNumber = clientUser5.PhoneNumber ?? string.Empty,
            InvitationToken = Guid.NewGuid().ToString("N"),
            InvitationStatus = InvitationStatus.Accepted,
            InvitedAt = now.AddMonths(-2),
            JoinedAt = now.AddMonths(-2).AddDays(2)
        };

        var pendingClientAr = new Client
        {
            Id = Guid.NewGuid(),
            UserId = null,
            CoachId = coach3.Id,
            FirstName = "عبدالله",
            LastName = "الدوسري",
            PhoneNumber = "+966500000004",
            InvitationToken = Guid.NewGuid().ToString("N"),
            InvitationStatus = InvitationStatus.Pending,
            InvitedAt = now.AddDays(-2)
        };

        context.Clients.AddRange(client1, client2, client3, pendingClient, client4, client5, pendingClientAr);

        // ── Connection Requests ────────────────────────────────────
        var connReqAccepted = new ConnectionRequest
        {
            Id = Guid.NewGuid(),
            CoachId = coach1.Id,
            FirstName = "Hamza",
            LastName = "El Fassi",
            PhoneNumber = "+212600000007",
            Email = "hamza@example.com",
            Message = "Hi coach, I'd like to train with you for the summer season.",
            Status = ConnectionRequestStatus.Accepted,
            CreatedAt = now.AddDays(7 *-4),
            ReviewedAt = now.AddDays(7 *-4).AddDays(1)
        };

        var connReqPending = new ConnectionRequest
        {
            Id = Guid.NewGuid(),
            CoachId = coach1.Id,
            FirstName = "Nadia",
            LastName = "Boukhris",
            PhoneNumber = "+212600000008",
            Email = "nadia@example.com",
            Message = "Looking for a coach to help me prepare for a marathon.",
            Status = ConnectionRequestStatus.Pending,
            CreatedAt = now.AddDays(-2)
        };

        var connReqRejected = new ConnectionRequest
        {
            Id = Guid.NewGuid(),
            CoachId = coach2.Id,
            FirstName = "Amine",
            LastName = "Khaldi",
            PhoneNumber = "+212600000009",
            Message = "Interested in your training programs.",
            Status = ConnectionRequestStatus.Rejected,
            CreatedAt = now.AddDays(7 *-2),
            ReviewedAt = now.AddDays(7 *-2).AddDays(3)
        };

        var connReqAr1 = new ConnectionRequest
        {
            Id = Guid.NewGuid(),
            CoachId = coach3.Id,
            FirstName = "سلطان",
            LastName = "المالكي",
            PhoneNumber = "+966500000005",
            Email = "sultan@example.com",
            Message = "السلام عليكم كابتن، أبغى أتدرب معك. عندي خبرة سنتين في رياضة كمال الأجسام وأبغى أطور مستواي.",
            Status = ConnectionRequestStatus.Pending,
            CreatedAt = now.AddDays(-1)
        };

        var connReqAr2 = new ConnectionRequest
        {
            Id = Guid.NewGuid(),
            CoachId = coach3.Id,
            FirstName = "ريم",
            LastName = "العتيبي",
            PhoneNumber = "+966500000006",
            Message = "مرحباً، أبحث عن مدرب لياقة بدنية يساعدني في تحقيق أهدافي الصحية. هل تقبل متدربات جدد؟",
            Status = ConnectionRequestStatus.Accepted,
            CreatedAt = now.AddDays(7 * -3),
            ReviewedAt = now.AddDays(7 * -3).AddDays(1)
        };

        context.ConnectionRequests.AddRange(connReqAccepted, connReqPending, connReqRejected, connReqAr1, connReqAr2);

        // ── Training Programs + Exercises ──────────────────────────
        var program1 = new TrainingProgram
        {
            Id = Guid.NewGuid(),
            CoachId = coach1.Id,
            Name = "Strength Foundations",
            Description = "An 8-week beginner strength program focusing on compound lifts and progressive overload.",
            CreatedAt = now.AddMonths(-2),
            Status = ProgramStatus.Active,
            Exercises = new List<Exercise>
            {
                new() { Id = Guid.NewGuid(), Name = "Barbell Squat", Description = "Back squat with barbell", Sets = 4, Reps = 8, RestSeconds = 120, Order = 1 },
                new() { Id = Guid.NewGuid(), Name = "Bench Press", Description = "Flat barbell bench press", Sets = 4, Reps = 8, RestSeconds = 120, Order = 2 },
                new() { Id = Guid.NewGuid(), Name = "Deadlift", Description = "Conventional deadlift", Sets = 3, Reps = 5, RestSeconds = 180, Order = 3 },
                new() { Id = Guid.NewGuid(), Name = "Overhead Press", Description = "Standing barbell press", Sets = 3, Reps = 10, RestSeconds = 90, Order = 4 },
                new() { Id = Guid.NewGuid(), Name = "Barbell Row", Description = "Bent-over barbell row", Sets = 4, Reps = 8, RestSeconds = 90, Order = 5 }
            }
        };

        var program2 = new TrainingProgram
        {
            Id = Guid.NewGuid(),
            CoachId = coach1.Id,
            Name = "HIIT Cardio Blast",
            Description = "High-intensity interval training for fat loss and cardiovascular conditioning.",
            CreatedAt = now.AddMonths(-1),
            Status = ProgramStatus.Active,
            Exercises = new List<Exercise>
            {
                new() { Id = Guid.NewGuid(), Name = "Burpees", Sets = 5, Reps = 15, RestSeconds = 30, Order = 1 },
                new() { Id = Guid.NewGuid(), Name = "Mountain Climbers", DurationSeconds = 45, RestSeconds = 15, Order = 2 },
                new() { Id = Guid.NewGuid(), Name = "Jump Squats", Sets = 4, Reps = 20, RestSeconds = 30, Order = 3 },
                new() { Id = Guid.NewGuid(), Name = "Box Jumps", Sets = 4, Reps = 12, RestSeconds = 45, Order = 4 }
            }
        };

        var program3 = new TrainingProgram
        {
            Id = Guid.NewGuid(),
            CoachId = coach2.Id,
            Name = "Marathon Prep",
            Description = "12-week progressive running plan to prepare for a full marathon.",
            CreatedAt = now.AddDays(7 *-3),
            Status = ProgramStatus.Active,
            Exercises = new List<Exercise>
            {
                new() { Id = Guid.NewGuid(), Name = "Easy Run", Description = "Zone 2 easy pace run", DurationSeconds = 2400, Order = 1 },
                new() { Id = Guid.NewGuid(), Name = "Tempo Run", Description = "Sustained tempo effort", DurationSeconds = 1800, Order = 2 },
                new() { Id = Guid.NewGuid(), Name = "Long Run", Description = "Weekly long slow distance", DurationSeconds = 5400, Order = 3 },
                new() { Id = Guid.NewGuid(), Name = "Interval 800m", Description = "800m repeats at 5K pace", Sets = 6, RestSeconds = 90, Order = 4 }
            }
        };

        var archivedProgram = new TrainingProgram
        {
            Id = Guid.NewGuid(),
            CoachId = coach1.Id,
            Name = "Old Beginner Program",
            Description = "Archived introductory program.",
            CreatedAt = now.AddMonths(-6),
            UpdatedAt = now.AddMonths(-3),
            Status = ProgramStatus.Archived
        };

        var programAr1 = new TrainingProgram
        {
            Id = Guid.NewGuid(),
            CoachId = coach3.Id,
            Name = "برنامج بناء العضلات للمبتدئين",
            Description = "برنامج تدريبي شامل مدته ٨ أسابيع مصمم للمبتدئين. يركز على التمارين المركبة وزيادة الأوزان تدريجياً لبناء أساس قوي.",
            CreatedAt = now.AddMonths(-3),
            Status = ProgramStatus.Active,
            Exercises = new List<Exercise>
            {
                new() { Id = Guid.NewGuid(), Name = "سكوات بالبار", Description = "تمرين القرفصاء بالبار الحديدي - تمرين أساسي للجزء السفلي", Sets = 4, Reps = 10, RestSeconds = 120, Order = 1, Notes = "حافظ على استقامة الظهر" },
                new() { Id = Guid.NewGuid(), Name = "بنش بريس", Description = "تمرين الضغط على البنش المسطح بالبار", Sets = 4, Reps = 8, RestSeconds = 120, Order = 2 },
                new() { Id = Guid.NewGuid(), Name = "ديدلفت", Description = "الرفعة المميتة - تمرين شامل لعضلات الجسم", Sets = 3, Reps = 6, RestSeconds = 180, Order = 3, Notes = "ابدأ بأوزان خفيفة وركز على الفورم" },
                new() { Id = Guid.NewGuid(), Name = "تمرين الكتف بالدمبل", Description = "رفع الدمبل فوق الرأس وأنت واقف", Sets = 3, Reps = 12, RestSeconds = 90, Order = 4 },
                new() { Id = Guid.NewGuid(), Name = "سحب أمامي", Description = "سحب البار للأسفل باتجاه الصدر - تمرين للظهر", Sets = 4, Reps = 10, RestSeconds = 90, Order = 5 },
                new() { Id = Guid.NewGuid(), Name = "تمرين البايسبس بالبار", Description = "ثني الذراعين بالبار المنحني", Sets = 3, Reps = 12, RestSeconds = 60, Order = 6 }
            }
        };

        var programAr2 = new TrainingProgram
        {
            Id = Guid.NewGuid(),
            CoachId = coach3.Id,
            Name = "برنامج حرق الدهون المكثف",
            Description = "برنامج تدريب متقطع عالي الشدة لحرق الدهون وتحسين اللياقة القلبية. مناسب لجميع المستويات مع إمكانية تعديل الشدة.",
            CreatedAt = now.AddMonths(-2),
            Status = ProgramStatus.Active,
            Exercises = new List<Exercise>
            {
                new() { Id = Guid.NewGuid(), Name = "بيربي", Description = "تمرين شامل يجمع بين القفز والضغط", Sets = 5, Reps = 12, RestSeconds = 30, Order = 1 },
                new() { Id = Guid.NewGuid(), Name = "قفز القرفصاء", Description = "سكوات مع قفزة في الأعلى", Sets = 4, Reps = 15, RestSeconds = 30, Order = 2 },
                new() { Id = Guid.NewGuid(), Name = "تسلق الجبل", Description = "وضعية البلانك مع تبديل الركب بسرعة", DurationSeconds = 45, RestSeconds = 15, Order = 3 },
                new() { Id = Guid.NewGuid(), Name = "نط الحبل", Description = "قفز بالحبل بسرعة متوسطة إلى عالية", DurationSeconds = 60, RestSeconds = 30, Order = 4 },
                new() { Id = Guid.NewGuid(), Name = "بلانك", Description = "ثبات على وضعية البلانك", DurationSeconds = 60, RestSeconds = 30, Order = 5, Notes = "حافظ على شد عضلات البطن" }
            }
        };

        var programAr3 = new TrainingProgram
        {
            Id = Guid.NewGuid(),
            CoachId = coach3.Id,
            Name = "برنامج تمارين قديم",
            Description = "برنامج تدريبي سابق تم أرشفته.",
            CreatedAt = now.AddMonths(-8),
            UpdatedAt = now.AddMonths(-4),
            Status = ProgramStatus.Archived
        };

        context.TrainingPrograms.AddRange(program1, program2, program3, archivedProgram, programAr1, programAr2, programAr3);

        // ── Program Assignments ────────────────────────────────────
        var assignment1 = new ProgramAssignment
        {
            Id = Guid.NewGuid(),
            ProgramId = program1.Id,
            ClientId = client1.Id,
            AssignedAt = now.AddMonths(-2).AddDays(3),
            Status = AssignmentStatus.Active
        };

        var assignment2 = new ProgramAssignment
        {
            Id = Guid.NewGuid(),
            ProgramId = program2.Id,
            ClientId = client2.Id,
            AssignedAt = now.AddDays(7 *-3),
            Status = AssignmentStatus.Active
        };

        var assignment3 = new ProgramAssignment
        {
            Id = Guid.NewGuid(),
            ProgramId = program3.Id,
            ClientId = client3.Id,
            AssignedAt = now.AddDays(7 *-2),
            Status = AssignmentStatus.Active
        };

        var completedAssignment = new ProgramAssignment
        {
            Id = Guid.NewGuid(),
            ProgramId = program1.Id,
            ClientId = client2.Id,
            AssignedAt = now.AddMonths(-2),
            Status = AssignmentStatus.Completed
        };

        var assignmentAr1 = new ProgramAssignment
        {
            Id = Guid.NewGuid(),
            ProgramId = programAr1.Id,
            ClientId = client4.Id,
            AssignedAt = now.AddMonths(-3).AddDays(5),
            Status = AssignmentStatus.Active
        };

        var assignmentAr2 = new ProgramAssignment
        {
            Id = Guid.NewGuid(),
            ProgramId = programAr2.Id,
            ClientId = client5.Id,
            AssignedAt = now.AddMonths(-2).AddDays(5),
            Status = AssignmentStatus.Active
        };

        context.ProgramAssignments.AddRange(assignment1, assignment2, assignment3, completedAssignment, assignmentAr1, assignmentAr2);

        // ── Workout Logs ───────────────────────────────────────────
        var exercises1 = program1.Exercises.ToList();
        var exercises2 = program2.Exercises.ToList();

        var workoutLogs = new List<WorkoutLog>();
        for (int week = 0; week < 4; week++)
        {
            foreach (var ex in exercises1)
            {
                workoutLogs.Add(new WorkoutLog
                {
                    Id = Guid.NewGuid(),
                    ClientId = client1.Id,
                    ProgramAssignmentId = assignment1.Id,
                    ExerciseId = ex.Id,
                    CompletedAt = now.AddMonths(-2).AddDays(3 + (week * 7)),
                    SetsCompleted = ex.Sets ?? 3,
                    RepsCompleted = ex.Reps ?? 8,
                    WeightUsed = 40m + (week * 5m),
                    Notes = week == 3 ? "Felt strong this week!" : null
                });
            }
        }

        for (int day = 0; day < 6; day++)
        {
            workoutLogs.Add(new WorkoutLog
            {
                Id = Guid.NewGuid(),
                ClientId = client2.Id,
                ProgramAssignmentId = assignment2.Id,
                ExerciseId = exercises2[day % exercises2.Count].Id,
                CompletedAt = now.AddDays(7 *-3).AddDays(day * 2),
                SetsCompleted = 5,
                RepsCompleted = 15,
                DurationSeconds = 1200
            });
        }

        var exercisesAr1 = programAr1.Exercises.ToList();
        var exercisesAr2 = programAr2.Exercises.ToList();

        for (int week = 0; week < 6; week++)
        {
            foreach (var ex in exercisesAr1)
            {
                workoutLogs.Add(new WorkoutLog
                {
                    Id = Guid.NewGuid(),
                    ClientId = client4.Id,
                    ProgramAssignmentId = assignmentAr1.Id,
                    ExerciseId = ex.Id,
                    CompletedAt = now.AddMonths(-3).AddDays(5 + (week * 7)),
                    SetsCompleted = ex.Sets ?? 3,
                    RepsCompleted = ex.Reps ?? 10,
                    WeightUsed = 30m + (week * 5m),
                    Notes = week == 5 ? "أحس بتحسن كبير في الأداء!" : null
                });
            }
        }

        for (int day = 0; day < 8; day++)
        {
            workoutLogs.Add(new WorkoutLog
            {
                Id = Guid.NewGuid(),
                ClientId = client5.Id,
                ProgramAssignmentId = assignmentAr2.Id,
                ExerciseId = exercisesAr2[day % exercisesAr2.Count].Id,
                CompletedAt = now.AddMonths(-2).AddDays(5 + (day * 3)),
                SetsCompleted = 4,
                RepsCompleted = 12,
                DurationSeconds = 900,
                Notes = day == 0 ? "أول تمرين - صعب لكن ممتع" : (day == 7 ? "التمارين صارت أسهل الحمد لله" : null)
            });
        }

        context.WorkoutLogs.AddRange(workoutLogs);

        // ── Progress Entries ───────────────────────────────────────
        var progressEntries = new List<ProgressEntry>();
        for (int week = 0; week <= 8; week++)
        {
            progressEntries.Add(new ProgressEntry
            {
                Id = Guid.NewGuid(),
                ClientId = client1.Id,
                Date = now.AddMonths(-2).AddDays(week * 7),
                Weight = 85.0m - (week * 0.3m),
                BodyFatPercentage = 22.0m - (week * 0.2m),
                Notes = week == 0 ? "Starting measurements" : (week == 8 ? "Great progress!" : null),
                CreatedAt = now.AddMonths(-2).AddDays(week * 7)
            });
        }

        for (int week = 0; week <= 4; week++)
        {
            progressEntries.Add(new ProgressEntry
            {
                Id = Guid.NewGuid(),
                ClientId = client2.Id,
                Date = now.AddMonths(-1).AddDays(week * 7),
                Weight = 68.5m - (week * 0.4m),
                BodyFatPercentage = 28.0m - (week * 0.3m),
                CreatedAt = now.AddMonths(-1).AddDays(week * 7)
            });
        }

        progressEntries.Add(new ProgressEntry
        {
            Id = Guid.NewGuid(),
            ClientId = client3.Id,
            Date = now.AddDays(7 *-2),
            Weight = 75.0m,
            BodyFatPercentage = 18.5m,
            Notes = "Baseline before marathon training",
            CreatedAt = now.AddDays(7 *-2)
        });

        for (int week = 0; week <= 6; week++)
        {
            progressEntries.Add(new ProgressEntry
            {
                Id = Guid.NewGuid(),
                ClientId = client4.Id,
                Date = now.AddMonths(-3).AddDays(week * 7),
                Weight = 92.0m - (week * 0.5m),
                BodyFatPercentage = 25.0m - (week * 0.3m),
                Notes = week == 0 ? "القياسات الأولية قبل بداية البرنامج" : (week == 6 ? "نتائج ممتازة! نزلت ٣ كيلو وزادت العضلات" : null),
                CreatedAt = now.AddMonths(-3).AddDays(week * 7)
            });
        }

        for (int week = 0; week <= 4; week++)
        {
            progressEntries.Add(new ProgressEntry
            {
                Id = Guid.NewGuid(),
                ClientId = client5.Id,
                Date = now.AddMonths(-2).AddDays(week * 7),
                Weight = 72.0m - (week * 0.6m),
                BodyFatPercentage = 30.0m - (week * 0.4m),
                Notes = week == 0 ? "بداية رحلة حرق الدهون" : (week == 4 ? "الحمد لله نزلت ٢.٤ كيلو!" : null),
                CreatedAt = now.AddMonths(-2).AddDays(week * 7)
            });
        }

        context.ProgressEntries.AddRange(progressEntries);

        // ── Reviews ────────────────────────────────────────────────
        var review1 = new Review
        {
            Id = Guid.NewGuid(),
            ClientRelationshipId = client1.Id,
            ReviewerUserId = clientUser1.Id,
            RevieweeUserId = coach1.Id,
            Rating = 5,
            Comment = "Excellent coach! Very knowledgeable and always available to answer questions. My strength has improved significantly.",
            CreatedAt = now.AddDays(7 *-1)
        };

        var review2 = new Review
        {
            Id = Guid.NewGuid(),
            ClientRelationshipId = client1.Id,
            ReviewerUserId = coach1.Id,
            RevieweeUserId = clientUser1.Id,
            Rating = 5,
            Comment = "Youssef is a dedicated and consistent client. Always follows the program and shows great results.",
            CreatedAt = now.AddDays(7 *-1).AddDays(1)
        };

        var review3 = new Review
        {
            Id = Guid.NewGuid(),
            ClientRelationshipId = client2.Id,
            ReviewerUserId = clientUser2.Id,
            RevieweeUserId = coach1.Id,
            Rating = 4,
            Comment = "Great training programs and good communication. Would appreciate more variety in exercises.",
            CreatedAt = now.AddDays(-5)
        };

        var review4 = new Review
        {
            Id = Guid.NewGuid(),
            ClientRelationshipId = client3.Id,
            ReviewerUserId = clientUser3.Id,
            RevieweeUserId = coach2.Id,
            Rating = 5,
            Comment = "Sara's marathon plan is incredible. Feeling more prepared than ever for race day!",
            CreatedAt = now.AddDays(-3)
        };

        var reviewAr1 = new Review
        {
            Id = Guid.NewGuid(),
            ClientRelationshipId = client4.Id,
            ReviewerUserId = clientUser4.Id,
            RevieweeUserId = coach3.Id,
            Rating = 5,
            Comment = "مدرب ممتاز ما شاء الله! البرنامج التدريبي منظم ومتدرج بشكل رائع. لاحظت تحسن كبير في قوتي خلال شهرين فقط. يتابع معك بشكل مستمر ويعدل البرنامج حسب مستواك.",
            CreatedAt = now.AddDays(7 * -1)
        };

        var reviewAr2 = new Review
        {
            Id = Guid.NewGuid(),
            ClientRelationshipId = client4.Id,
            ReviewerUserId = coach3.Id,
            RevieweeUserId = clientUser4.Id,
            Rating = 5,
            Comment = "محمد متدرب ملتزم وجاد. يتبع البرنامج بدقة ويسأل أسئلة ممتازة. حقق نتائج رائعة في وقت قصير. مستمرين إن شاء الله!",
            CreatedAt = now.AddDays(7 * -1).AddDays(1)
        };

        var reviewAr3 = new Review
        {
            Id = Guid.NewGuid(),
            ClientRelationshipId = client5.Id,
            ReviewerUserId = clientUser5.Id,
            RevieweeUserId = coach3.Id,
            Rating = 4,
            Comment = "كابتن خالد شخص محترم ومتفهم. البرنامج كان مناسب لمستواي كمبتدئة. أتمنى لو يكون فيه تمارين أكثر تنوع للبنات بس بشكل عام تجربة حلوة.",
            CreatedAt = now.AddDays(-4)
        };

        context.Reviews.AddRange(review1, review2, review3, review4, reviewAr1, reviewAr2, reviewAr3);

        // ── Meal Programs + Days + Items ───────────────────────────
        var mealProgram1 = new MealProgram
        {
            Id = Guid.NewGuid(),
            CoachId = coach1.Id,
            Name = "Lean Bulk Nutrition Plan",
            Description = "High-protein meal plan designed for muscle gain with minimal fat accumulation.",
            CreatedAt = now.AddMonths(-1),
            Status = ProgramStatus.Active,
            Days = new List<MealDay>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "Training Day",
                    Order = 1,
                    Items = new List<MealItem>
                    {
                        new() { Id = Guid.NewGuid(), Name = "Oatmeal with Banana & Peanut Butter", Description = "Rolled oats, 1 banana, 2 tbsp peanut butter, honey drizzle", Calories = 520, ProteinGrams = 18m, CarbsGrams = 72m, FatGrams = 16m, Order = 1 },
                        new() { Id = Guid.NewGuid(), Name = "Grilled Chicken & Rice Bowl", Description = "200g chicken breast, 150g basmati rice, steamed broccoli, olive oil", Calories = 650, ProteinGrams = 48m, CarbsGrams = 65m, FatGrams = 14m, Order = 2 },
                        new() { Id = Guid.NewGuid(), Name = "Protein Shake", Description = "Whey protein, banana, almond milk, oats", Calories = 380, ProteinGrams = 35m, CarbsGrams = 42m, FatGrams = 8m, Notes = "Post-workout within 30 minutes", Order = 3 },
                        new() { Id = Guid.NewGuid(), Name = "Salmon with Sweet Potato", Description = "180g Atlantic salmon, baked sweet potato, mixed salad", Calories = 580, ProteinGrams = 40m, CarbsGrams = 48m, FatGrams = 22m, Order = 4 },
                        new() { Id = Guid.NewGuid(), Name = "Greek Yogurt & Mixed Nuts", Description = "200g Greek yogurt, 30g almonds, 30g walnuts, berries", Calories = 420, ProteinGrams = 24m, CarbsGrams = 28m, FatGrams = 24m, Notes = "Before bed snack", Order = 5 }
                    }
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "Rest Day",
                    Order = 2,
                    Items = new List<MealItem>
                    {
                        new() { Id = Guid.NewGuid(), Name = "Egg White Omelette", Description = "6 egg whites, spinach, tomatoes, feta cheese", Calories = 280, ProteinGrams = 32m, CarbsGrams = 8m, FatGrams = 12m, Order = 1 },
                        new() { Id = Guid.NewGuid(), Name = "Tuna Salad Wrap", Description = "Whole wheat wrap, tuna, lettuce, light mayo, avocado", Calories = 450, ProteinGrams = 38m, CarbsGrams = 35m, FatGrams = 16m, Order = 2 },
                        new() { Id = Guid.NewGuid(), Name = "Grilled Turkey & Vegetables", Description = "200g turkey breast, roasted zucchini, bell peppers, quinoa", Calories = 520, ProteinGrams = 45m, CarbsGrams = 42m, FatGrams = 12m, Order = 3 },
                        new() { Id = Guid.NewGuid(), Name = "Cottage Cheese Bowl", Description = "250g cottage cheese, honey, chia seeds, berries", Calories = 320, ProteinGrams = 28m, CarbsGrams = 30m, FatGrams = 8m, Notes = "Evening snack", Order = 4 }
                    }
                }
            }
        };

        var mealProgram2 = new MealProgram
        {
            Id = Guid.NewGuid(),
            CoachId = coach1.Id,
            Name = "Fat Loss Plan",
            Description = "Calorie-deficit plan with high protein to preserve muscle during cutting phase.",
            CreatedAt = now.AddDays(7 *-2),
            Status = ProgramStatus.Active,
            Days = new List<MealDay>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "Standard Day",
                    Order = 1,
                    Items = new List<MealItem>
                    {
                        new() { Id = Guid.NewGuid(), Name = "Scrambled Eggs on Toast", Description = "3 whole eggs, 1 slice whole wheat toast", Calories = 350, ProteinGrams = 24m, CarbsGrams = 20m, FatGrams = 18m, Order = 1 },
                        new() { Id = Guid.NewGuid(), Name = "Chicken Salad", Description = "150g chicken breast, mixed greens, cucumber, tomatoes, vinaigrette", Calories = 380, ProteinGrams = 40m, CarbsGrams = 12m, FatGrams = 16m, Order = 2 },
                        new() { Id = Guid.NewGuid(), Name = "White Fish with Asparagus", Description = "200g cod, grilled asparagus, lemon, herbs", Calories = 300, ProteinGrams = 42m, CarbsGrams = 8m, FatGrams = 10m, Order = 3 }
                    }
                }
            }
        };

        var mealProgram3 = new MealProgram
        {
            Id = Guid.NewGuid(),
            CoachId = coach2.Id,
            Name = "Marathon Runner Fuel Plan",
            Description = "Carb-focused nutrition plan for endurance athletes in training.",
            CreatedAt = now.AddDays(7 *-2),
            Status = ProgramStatus.Active,
            Days = new List<MealDay>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "Long Run Day",
                    Order = 1,
                    Items = new List<MealItem>
                    {
                        new() { Id = Guid.NewGuid(), Name = "Pancakes with Maple Syrup", Description = "3 whole wheat pancakes, maple syrup, banana slices", Calories = 580, ProteinGrams = 14m, CarbsGrams = 95m, FatGrams = 12m, Notes = "2-3 hours before run", Order = 1 },
                        new() { Id = Guid.NewGuid(), Name = "Energy Gel", Description = "During run every 45 minutes", Calories = 100, ProteinGrams = 0m, CarbsGrams = 25m, FatGrams = 0m, Order = 2 },
                        new() { Id = Guid.NewGuid(), Name = "Recovery Smoothie", Description = "Chocolate milk, banana, peanut butter, protein powder", Calories = 480, ProteinGrams = 30m, CarbsGrams = 62m, FatGrams = 12m, Notes = "Within 30 min post-run", Order = 3 },
                        new() { Id = Guid.NewGuid(), Name = "Pasta with Lean Beef Sauce", Description = "Whole wheat pasta, lean ground beef, tomato sauce, parmesan", Calories = 720, ProteinGrams = 42m, CarbsGrams = 85m, FatGrams = 18m, Order = 4 }
                    }
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "Easy Day",
                    Order = 2,
                    Items = new List<MealItem>
                    {
                        new() { Id = Guid.NewGuid(), Name = "Avocado Toast with Eggs", Description = "2 slices sourdough, avocado, 2 poached eggs", Calories = 450, ProteinGrams = 20m, CarbsGrams = 38m, FatGrams = 24m, Order = 1 },
                        new() { Id = Guid.NewGuid(), Name = "Quinoa & Veggie Bowl", Description = "Quinoa, roasted chickpeas, sweet potato, tahini dressing", Calories = 520, ProteinGrams = 18m, CarbsGrams = 68m, FatGrams = 18m, Order = 2 },
                        new() { Id = Guid.NewGuid(), Name = "Baked Chicken Thighs", Description = "Chicken thighs, brown rice, steamed green beans", Calories = 580, ProteinGrams = 38m, CarbsGrams = 52m, FatGrams = 20m, Order = 3 }
                    }
                }
            }
        };

        var mealProgramAr1 = new MealProgram
        {
            Id = Guid.NewGuid(),
            CoachId = coach3.Id,
            Name = "نظام غذائي لبناء العضلات",
            Description = "نظام غذائي عالي البروتين مصمم لدعم بناء العضلات وزيادة الكتلة العضلية مع الحفاظ على نسبة دهون منخفضة.",
            CreatedAt = now.AddMonths(-2),
            Status = ProgramStatus.Active,
            Days = new List<MealDay>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "يوم التمرين",
                    Order = 1,
                    Items = new List<MealItem>
                    {
                        new() { Id = Guid.NewGuid(), Name = "فول مدمس مع بيض", Description = "فول مدمس بزيت الزيتون، ٣ بيضات مسلوقة، خبز بر كامل", Calories = 550, ProteinGrams = 32m, CarbsGrams = 58m, FatGrams = 18m, Notes = "وجبة الفطور - قبل التمرين بساعتين", Order = 1 },
                        new() { Id = Guid.NewGuid(), Name = "صدور دجاج مشوية مع أرز", Description = "٢٥٠ جرام صدر دجاج مشوي، ١٥٠ جرام أرز بسمتي، سلطة خضراء", Calories = 680, ProteinGrams = 52m, CarbsGrams = 70m, FatGrams = 12m, Order = 2 },
                        new() { Id = Guid.NewGuid(), Name = "شيك بروتين بالموز", Description = "سكوب بروتين، موزة، حليب لوز، شوفان", Calories = 400, ProteinGrams = 38m, CarbsGrams = 45m, FatGrams = 8m, Notes = "بعد التمرين مباشرة", Order = 3 },
                        new() { Id = Guid.NewGuid(), Name = "سمك سلمون مع بطاطا حلوة", Description = "٢٠٠ جرام سلمون مشوي، بطاطا حلوة مشوية، خضار سوتيه", Calories = 620, ProteinGrams = 42m, CarbsGrams = 52m, FatGrams = 22m, Order = 4 },
                        new() { Id = Guid.NewGuid(), Name = "زبادي يوناني مع مكسرات", Description = "٢٠٠ جرام زبادي يوناني، لوز وجوز، عسل", Calories = 380, ProteinGrams = 22m, CarbsGrams = 28m, FatGrams = 20m, Notes = "وجبة خفيفة قبل النوم", Order = 5 }
                    }
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "يوم الراحة",
                    Order = 2,
                    Items = new List<MealItem>
                    {
                        new() { Id = Guid.NewGuid(), Name = "شكشوكة", Description = "بيض مطبوخ بصلصة الطماطم والفلفل، خبز عربي", Calories = 380, ProteinGrams = 24m, CarbsGrams = 30m, FatGrams = 18m, Order = 1 },
                        new() { Id = Guid.NewGuid(), Name = "صدور ديك رومي مع كينوا", Description = "٢٠٠ جرام ديك رومي، كينوا، خضار مشوية", Calories = 520, ProteinGrams = 48m, CarbsGrams = 45m, FatGrams = 10m, Order = 2 },
                        new() { Id = Guid.NewGuid(), Name = "سلطة تونة", Description = "تونة معلبة بالماء، خضار مشكلة، زيت زيتون، ليمون", Calories = 350, ProteinGrams = 35m, CarbsGrams = 12m, FatGrams = 16m, Order = 3 },
                        new() { Id = Guid.NewGuid(), Name = "جبنة قريش مع خيار", Description = "٢٠٠ جرام جبنة قريش، خيار، نعناع، زيت زيتون", Calories = 220, ProteinGrams = 28m, CarbsGrams = 8m, FatGrams = 8m, Notes = "وجبة خفيفة مسائية", Order = 4 }
                    }
                }
            }
        };

        var mealProgramAr2 = new MealProgram
        {
            Id = Guid.NewGuid(),
            CoachId = coach3.Id,
            Name = "نظام غذائي لحرق الدهون",
            Description = "نظام غذائي منخفض السعرات مع نسبة بروتين عالية للحفاظ على العضلات أثناء فترة التنشيف وحرق الدهون.",
            CreatedAt = now.AddDays(7 * -3),
            Status = ProgramStatus.Active,
            Days = new List<MealDay>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "اليوم العادي",
                    Order = 1,
                    Items = new List<MealItem>
                    {
                        new() { Id = Guid.NewGuid(), Name = "أومليت بياض البيض مع سبانخ", Description = "٦ بياض بيض، سبانخ، فلفل، بصل", Calories = 250, ProteinGrams = 30m, CarbsGrams = 6m, FatGrams = 10m, Order = 1 },
                        new() { Id = Guid.NewGuid(), Name = "صدر دجاج مع سلطة", Description = "١٥٠ جرام دجاج مشوي، سلطة كبيرة بالخل", Calories = 320, ProteinGrams = 38m, CarbsGrams = 10m, FatGrams = 14m, Order = 2 },
                        new() { Id = Guid.NewGuid(), Name = "سمك مشوي مع خضار", Description = "٢٠٠ جرام سمك أبيض، هليون مشوي، ليمون", Calories = 280, ProteinGrams = 40m, CarbsGrams = 8m, FatGrams = 8m, Order = 3 }
                    }
                }
            }
        };

        context.MealPrograms.AddRange(mealProgram1, mealProgram2, mealProgram3, mealProgramAr1, mealProgramAr2);

        // ── Meal Program Assignments ───────────────────────────────
        var mealAssignment1 = new MealProgramAssignment
        {
            Id = Guid.NewGuid(),
            MealProgramId = mealProgram1.Id,
            ClientId = client1.Id,
            AssignedAt = now.AddMonths(-1).AddDays(5),
            Status = AssignmentStatus.Active
        };

        var mealAssignment2 = new MealProgramAssignment
        {
            Id = Guid.NewGuid(),
            MealProgramId = mealProgram2.Id,
            ClientId = client2.Id,
            AssignedAt = now.AddDays(7 *-2),
            Status = AssignmentStatus.Active
        };

        var mealAssignment3 = new MealProgramAssignment
        {
            Id = Guid.NewGuid(),
            MealProgramId = mealProgram3.Id,
            ClientId = client3.Id,
            AssignedAt = now.AddDays(7 *-2),
            Status = AssignmentStatus.Active
        };

        var mealAssignmentAr1 = new MealProgramAssignment
        {
            Id = Guid.NewGuid(),
            MealProgramId = mealProgramAr1.Id,
            ClientId = client4.Id,
            AssignedAt = now.AddMonths(-2).AddDays(3),
            Status = AssignmentStatus.Active
        };

        var mealAssignmentAr2 = new MealProgramAssignment
        {
            Id = Guid.NewGuid(),
            MealProgramId = mealProgramAr2.Id,
            ClientId = client5.Id,
            AssignedAt = now.AddDays(7 * -3),
            Status = AssignmentStatus.Active
        };

        context.MealProgramAssignments.AddRange(mealAssignment1, mealAssignment2, mealAssignment3, mealAssignmentAr1, mealAssignmentAr2);

        // ── Save all ───────────────────────────────────────────────
        await context.SaveChangesAsync();

        logger.LogInformation(
            "Database seeded: {Users} users, {Clients} clients, {Programs} training programs, " +
            "{MealPrograms} meal programs, {Assignments} assignments, {Logs} workout logs, " +
            "{Progress} progress entries, {Reviews} reviews, {Connections} connection requests.",
            8, 7, 7, 5, 9, workoutLogs.Count, progressEntries.Count, 7, 5);
    }

    private static async Task<ApplicationUser> SeedUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string firstName,
        string lastName,
        string phoneNumber,
        UserRole role,
        DateTime createdAt)
    {
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FirstName = firstName,
            LastName = lastName,
            PhoneNumber = phoneNumber,
            Role = role,
            CreatedAt = createdAt
        };
        var result = await userManager.CreateAsync(user, "Test123!");
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => $"{e.Code}:{e.Description}"));
            throw new InvalidOperationException($"Failed to seed user {email}: {errors}");
        }
        return user;
    }
}
