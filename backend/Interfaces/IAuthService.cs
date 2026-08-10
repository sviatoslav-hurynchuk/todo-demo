using TodoApp.Interfaces.DTOs;

namespace TodoApp.Interfaces;

public interface IAuthService
{
    Task<(AuthResponseDto Response, string RefreshToken)> RegisterAsync(RegisterDto dto, string ipAddress);
    Task<(AuthResponseDto Response, string RefreshToken)> LoginAsync(LoginDto dto, string ipAddress);
    Task<(AuthResponseDto Response, string RefreshToken)> RefreshTokenAsync(string refreshToken, string ipAddress);
    Task RevokeTokenAsync(string refreshToken, string ipAddress, int userId);
}
