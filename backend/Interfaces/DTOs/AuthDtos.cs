using System.ComponentModel.DataAnnotations;

namespace TodoApp.Interfaces.DTOs;

public record RegisterDto(
    [Required, MinLength(3), MaxLength(50)] string Username,
    [Required, EmailAddress, MaxLength(100)] string Email,
    [Required, MinLength(6)] string Password
);

public record LoginDto(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record AuthResponseDto(
    string AccessToken,
    string Username,
    string Email
);

public record RevokeTokenRequest(
    string? Token
);
