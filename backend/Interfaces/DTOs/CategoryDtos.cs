using System.ComponentModel.DataAnnotations;

namespace TodoApp.Interfaces.DTOs;

public record CategoryDto(
    int Id,
    string Name,
    string Color,
    string? Icon,
    int TaskCount
);

public record CreateCategoryDto(
    [Required, MinLength(1), MaxLength(50)] string Name,
    [MaxLength(20)] string Color = "#3B82F6",
    [MaxLength(50)] string? Icon = null
);

public record UpdateCategoryDto(
    [Required, MinLength(1), MaxLength(50)] string Name,
    [MaxLength(20)] string Color = "#3B82F6",
    [MaxLength(50)] string? Icon = null
);
