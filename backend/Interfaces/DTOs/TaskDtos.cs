using System.ComponentModel.DataAnnotations;

namespace TodoApp.Interfaces.DTOs;

public record TaskDto(
    int Id,
    string Title,
    string? Description,
    bool IsCompleted,
    bool IsImportant,
    DateTime? DueDate,
    int? CategoryId,
    string? CategoryName
);

public record CreateTaskDto(
    [Required, MinLength(1), MaxLength(255)] string Title,
    [MaxLength(2000)] string? Description,
    DateTime? DueDate,
    int? CategoryId,
    bool IsImportant = false
);

public record UpdateTaskDto(
    [Required, MinLength(1), MaxLength(255)] string Title,
    [MaxLength(2000)] string? Description,
    bool IsCompleted,
    bool IsImportant,
    DateTime? DueDate,
    int? CategoryId
);

public record PagedResultDto<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages
);
