using TodoApp.Interfaces.DTOs;

namespace TodoApp.Interfaces;

public interface ITaskService
{
    Task<PagedResultDto<TaskDto>> GetAllAsync(int userId, int page, int pageSize, string? search, bool? isCompleted, bool? isImportant, int? categoryId);
    Task<TaskDto> GetByIdAsync(int id, int userId);
    Task<TaskDto> CreateAsync(CreateTaskDto dto, int userId);
    Task<TaskDto> UpdateAsync(int id, UpdateTaskDto dto, int userId);
    Task DeleteAsync(int id, int userId);
    Task<TaskDto> ToggleCompleteAsync(int id, int userId);
}
