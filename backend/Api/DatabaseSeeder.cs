using Bogus;
using Microsoft.EntityFrameworkCore;
using TodoApp.DataAccess.Data;
using TodoApp.DataAccess.Entities;

namespace TodoApp.Api;

/// <summary>
/// Seeds the database with realistic demo data on first startup.
/// Only runs in Development environment when the database is empty.
/// </summary>
public static class DatabaseSeeder
{
    private const int Seed = 42; // Fixed seed for reproducible data
    private static readonly DateTime SeedReferenceUtc = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    public static async Task SeedAsync(AppDbContext db)
    {
        // Skip if any user already exists (database already seeded or has real data)
        if (await db.Users.AnyAsync())
            return;

        Randomizer.Seed = new Random(Seed);

        // ── 1. Create demo user ──────────────────────────────────────────
        var demoUser = new User
        {
            Username = "demo",
            Email = "demo@todoapp.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo123!"),
            CreatedAt = SeedReferenceUtc.AddDays(-90)
        };

        db.Users.Add(demoUser);
        await db.SaveChangesAsync(); // Save to get the UserId

        // ── 2. Create categories ─────────────────────────────────────────
        var categories = new List<Category>
        {
            new() { Name = "Work",       Color = "#3B82F6", UserId = demoUser.Id },  // Blue
            new() { Name = "Personal",   Color = "#10B981", UserId = demoUser.Id },  // Green
            new() { Name = "Shopping",   Color = "#F59E0B", UserId = demoUser.Id },  // Amber
            new() { Name = "Health",     Color = "#EF4444", UserId = demoUser.Id },  // Red
            new() { Name = "Learning",   Color = "#8B5CF6", UserId = demoUser.Id },  // Purple
        };

        db.Categories.AddRange(categories);
        await db.SaveChangesAsync(); // Save to get CategoryIds

        // ── 3. Generate 40 unique tasks with Bogus ───────────────────────
        var selectedTitles = GetTaskTitles().Take(40).ToList();

        var taskFaker = new Faker<TaskItem>()
            .RuleFor(t => t.UserId, _ => demoUser.Id)
            .RuleFor(t => t.Description, f => f.Random.Bool(0.6f) ? f.Lorem.Sentence(8, 15) : null)
            .RuleFor(t => t.IsCompleted, f => f.Random.Bool(0.25f))
            .RuleFor(t => t.IsImportant, f => f.Random.Bool(0.2f))
            .RuleFor(t => t.DueDate, f => f.Random.Bool(0.65f)
                ? DateOnly.FromDateTime(f.Date.Between(SeedReferenceUtc.AddDays(-10), SeedReferenceUtc.AddDays(60)))
                : null)
            .RuleFor(t => t.CategoryId, f => f.Random.Bool(0.8f)
                ? f.PickRandom(categories).Id
                : null)
            .RuleFor(t => t.CreatedAt, f => f.Date.Recent(60, SeedReferenceUtc));

        var tasks = selectedTitles.Select(title =>
        {
            var task = taskFaker.Generate();
            task.Title = title;
            return task;
        }).ToList();

        db.Tasks.AddRange(tasks);
        await db.SaveChangesAsync();
    }

    /// <summary>
    /// Curated list of realistic task titles across all categories.
    /// </summary>
    private static string[] GetTaskTitles() =>
    [
        // Work
        "Review pull request #42",
        "Prepare sprint retrospective slides",
        "Update API documentation",
        "Fix login page validation bug",
        "Deploy staging environment",
        "Write unit tests for auth service",
        "Set up CI/CD pipeline",
        "Refactor database queries for performance",
        "Schedule meeting with design team",
        "Create technical design document",
        "Update project dependencies",
        "Configure monitoring alerts",

        // Personal
        "Call dentist for appointment",
        "Book flights for vacation",
        "Renew gym membership",
        "Organize photo library",
        "Update resume and LinkedIn",
        "Plan birthday dinner",
        "Clean out garage",
        "Fix leaky kitchen faucet",
        "Research new laptop options",
        "Cancel unused subscriptions",

        // Shopping
        "Buy groceries for the week",
        "Order new running shoes",
        "Pick up dry cleaning",
        "Buy birthday gift for mom",
        "Restock office supplies",
        "Order replacement phone charger",
        "Buy new desk lamp",
        "Get winter tires installed",

        // Health
        "Morning jog — 5km",
        "Meal prep for the week",
        "Schedule annual checkup",
        "Try new yoga class",
        "Track water intake daily",
        "Research healthy recipes",
        "Book eye exam appointment",

        // Learning
        "Complete Angular tutorial chapter 5",
        "Read 'Clean Code' — chapter 3",
        "Practice TypeScript generics",
        "Watch conference talk on RxJS patterns",
        "Study for Azure certification",
        "Build a side project with Rust",
        "Finish online course on system design",
        "Review EF Core migration strategies",
        "Learn Docker Compose basics",
        "Read article on JWT best practices"
    ];
}
