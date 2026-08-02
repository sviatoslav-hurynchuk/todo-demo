namespace TodoApp.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(int userId, string email, string username);
    string GenerateRefreshToken();
}
