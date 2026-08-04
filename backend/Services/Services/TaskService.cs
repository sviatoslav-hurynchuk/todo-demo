using Microsoft.EntityFrameworkCore;
using TodoApp.DataAccess.Data;
using TodoApp.DataAccess.Entities;
using TodoApp.Interfaces;
using TodoApp.Interfaces.DTOs;

namespace TodoApp.Services.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;

    public TaskService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResultDto<TaskDto>> GetAllAsync(int userId, int page, int pageSize, string? search, bool? isCompleted, bool? isImportant, int? categoryId)
    {
        var query = _context.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t => t.Title.Contains(search) || (t.Description != null && t.Description.Contains(search)));
        }

        if (isCompleted.HasValue)
        {
            query = query.Where(t => t.IsCompleted == isCompleted.Value);
        }

        if (isImportant.HasValue)
        {
            query = query.Where(t => t.IsImportant == isImportant.Value);
        }

        if (categoryId.HasValue)
        {
            query = query.Where(t => t.CategoryId == categoryId.Value);
        }

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .OrderByDescending(t => t.IsImportant)
            .ThenByDescending(t => t.CreatedAt)
            .ThenBy(t => t.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TaskDto(
                t.Id,
                t.Title,
                t.Description,
                t.IsCompleted,
                t.IsImportant,
                t.DueDate,
                t.CategoryId,
                t.Category != null ? t.Category.Name : null
            ))
            .ToListAsync();

        return new PagedResultDto<TaskDto>(items, totalCount, page, pageSize, totalPages);
    }

    public async Task<TaskDto> GetByIdAsync(int id, int userId)
    {
        var task = await _context.Tasks
            .AsNoTracking()
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (task is null)
        {
            throw new KeyNotFoundException($"Task with id {id} not found.");
        }

        return MapToDto(task);
    }

    public async Task<TaskDto> CreateAsync(CreateTaskDto dto, int userId)
    {
        Category? category = await ValidateAndGetCategoryAsync(dto.CategoryId, userId);

        var task = new TaskItem
        {
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            DueDate = dto.DueDate,
            CategoryId = dto.CategoryId,
            Category = category,
            IsImportant = dto.IsImportant,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return MapToDto(task);
    }

    public async Task<TaskDto> UpdateAsync(int id, UpdateTaskDto dto, int userId)
    {
        var task = await _context.Tasks
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (task is null)
        {
            throw new KeyNotFoundException($"Task with id {id} not found.");
        }

        Category? category = await ValidateAndGetCategoryAsync(dto.CategoryId, userId);

        task.Title = dto.Title.Trim();
        task.Description = dto.Description?.Trim();
        task.IsCompleted = dto.IsCompleted;
        task.IsImportant = dto.IsImportant;
        task.DueDate = dto.DueDate;
        task.CategoryId = dto.CategoryId;
        task.Category = category;

        await _context.SaveChangesAsync();

        return MapToDto(task);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (task is null)
        {
            throw new KeyNotFoundException($"Task with id {id} not found.");
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
    }

    public async Task<TaskDto> ToggleCompleteAsync(int id, int userId)
    {
        var task = await _context.Tasks
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (task is null)
        {
            throw new KeyNotFoundException($"Task with id {id} not found.");
        }

        task.IsCompleted = !task.IsCompleted;
        await _context.SaveChangesAsync();

        return MapToDto(task);
    }

    private async Task<Category?> ValidateAndGetCategoryAsync(int? categoryId, int userId)
    {
        if (!categoryId.HasValue)
        {
            return null;
        }

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == categoryId.Value && c.UserId == userId);

        if (category is null)
        {
            throw new KeyNotFoundException($"Category with id {categoryId.Value} not found.");
        }

        return category;
    }

    private static TaskDto MapToDto(TaskItem task) => new(
        task.Id,
        task.Title,
        task.Description,
        task.IsCompleted,
        task.IsImportant,
        task.DueDate,
        task.CategoryId,
        task.Category?.Name
    );
}
