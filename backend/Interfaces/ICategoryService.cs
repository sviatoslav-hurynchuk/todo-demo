using TodoApp.Interfaces.DTOs;

namespace TodoApp.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllAsync(int userId);
    Task<CategoryDto> GetByIdAsync(int id, int userId);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto, int userId);
    Task<CategoryDto> UpdateAsync(int id, UpdateCategoryDto dto, int userId);
    Task DeleteAsync(int id, int userId);
}