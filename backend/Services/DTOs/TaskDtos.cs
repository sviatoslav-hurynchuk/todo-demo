namespace TodoApp.Services.DTOs;

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
    string Title,
    string? Description,
    DateTime? DueDate,
    int? CategoryId,
    bool IsImportant
);

public record UpdateTaskDto(
    string Title,
    string? Description,
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
