namespace TodoApp.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(int userId, string email, string username);
}
