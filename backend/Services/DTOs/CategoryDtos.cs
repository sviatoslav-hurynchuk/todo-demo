namespace TodoApp.Services.DTOs;

public record CategoryDto(int Id, string Name, string Color, string? Icon, int TaskCount);
public record CreateCategoryDto(string Name, string Color, string? Icon);
