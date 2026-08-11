using TodoApp.Interfaces.Common;
using TodoApp.Interfaces.DTOs;

namespace TodoApp.Interfaces;

public interface IAuthService
{
    Task<Result<(AuthResponseDto Response, string RefreshToken)>> RegisterAsync(RegisterDto dto, string ipAddress);
    Task<Result<(AuthResponseDto Response, string RefreshToken)>> LoginAsync(LoginDto dto, string ipAddress);
    Task<Result<(AuthResponseDto Response, string RefreshToken)>> RefreshTokenAsync(string refreshToken, string ipAddress);
    Task<Result> RevokeTokenAsync(string refreshToken, string ipAddress, int userId);
}
