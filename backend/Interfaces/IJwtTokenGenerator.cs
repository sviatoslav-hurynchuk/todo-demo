using TodoApp.DataAccess.Entities;

namespace TodoApp.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(int userId, string email, string username);
    RefreshToken GenerateRefreshToken(string ipAddress);
}
