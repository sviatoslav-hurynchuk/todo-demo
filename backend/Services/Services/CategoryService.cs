using Microsoft.EntityFrameworkCore;
using TodoApp.DataAccess.Data;
using TodoApp.DataAccess.Entities;
using TodoApp.Interfaces;
using TodoApp.Interfaces.DTOs;

namespace TodoApp.Services.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync(int userId)
    {
        return await _context.Categories
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Color,
                c.Icon,
                c.Tasks.Count
            ))
            .ToListAsync();
    }

    public async Task<CategoryDto> GetByIdAsync(int id, int userId)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .Where(c => c.Id == id && c.UserId == userId)
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Color,
                c.Icon,
                c.Tasks.Count
            ))
            .FirstOrDefaultAsync();

        if (category is null)
        {
            throw new KeyNotFoundException($"Category with id {id} not found.");
        }

        return category;
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, int userId)
    {
        var category = new Category
        {
            Name = dto.Name.Trim(),
            Color = dto.Color,
            Icon = dto.Icon,
            UserId = userId
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return new CategoryDto(category.Id, category.Name, category.Color, category.Icon, 0);
    }

    public async Task<CategoryDto> UpdateAsync(int id, UpdateCategoryDto dto, int userId)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category is null)
        {
            throw new KeyNotFoundException($"Category with id {id} not found.");
        }

        category.Name = dto.Name.Trim();
        category.Color = dto.Color;
        category.Icon = dto.Icon;

        await _context.SaveChangesAsync();

        var taskCount = await _context.Tasks.CountAsync(t => t.CategoryId == id);
        return new CategoryDto(category.Id, category.Name, category.Color, category.Icon, taskCount);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category is null)
        {
            throw new KeyNotFoundException($"Category with id {id} not found.");
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }
}
