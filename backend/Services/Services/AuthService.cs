using Microsoft.EntityFrameworkCore;
using TodoApp.DataAccess.Data;
using TodoApp.DataAccess.Entities;
using TodoApp.Interfaces;
using TodoApp.Interfaces.DTOs;

namespace TodoApp.Services.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(AppDbContext context, IJwtTokenGenerator jwtTokenGenerator)
    {
        _context = context;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (emailExists)
        {
            throw new InvalidOperationException("User with this email already exists.");
        }

        var usernameExists = await _context.Users.AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower());
        if (usernameExists)
        {
            throw new InvalidOperationException("User with this username already exists.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var user = new User
        {
            Username = dto.Username.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _jwtTokenGenerator.GenerateToken(user.Id, user.Email, user.Username);
        return new AuthResponseDto(token, user.Username, user.Email);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        var token = _jwtTokenGenerator.GenerateToken(user.Id, user.Email, user.Username);
        return new AuthResponseDto(token, user.Username, user.Email);
    }
}
