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

    public async Task<(AuthResponseDto Response, string RefreshToken)> RegisterAsync(RegisterDto dto, string ipAddress)
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

        var refreshTokenString = _jwtTokenGenerator.GenerateRefreshToken();
        var refreshToken = new RefreshToken
        {
            Token = refreshTokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = ipAddress
        };

        user.RefreshTokens.Add(refreshToken);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user.Id, user.Email, user.Username);
        var response = new AuthResponseDto(accessToken, user.Username, user.Email);

        return (response, refreshToken.Token);
    }

    public async Task<(AuthResponseDto Response, string RefreshToken)> LoginAsync(LoginDto dto, string ipAddress)
    {
        var user = await _context.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        var refreshTokenString = _jwtTokenGenerator.GenerateRefreshToken();
        var refreshToken = new RefreshToken
        {
            Token = refreshTokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = ipAddress
        };

        user.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user.Id, user.Email, user.Username);
        var response = new AuthResponseDto(accessToken, user.Username, user.Email);

        return (response, refreshToken.Token);
    }

    public async Task<(AuthResponseDto Response, string RefreshToken)> RefreshTokenAsync(string refreshToken, string ipAddress)
    {
        var user = await _context.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == refreshToken));

        if (user == null)
        {
            throw new InvalidOperationException("Invalid token.");
        }

        var tokenEntity = user.RefreshTokens.Single(t => t.Token == refreshToken);

        if (tokenEntity.IsRevoked)
        {
            RevokeDescendantRefreshTokens(tokenEntity, user, ipAddress, $"Attempted reuse of revoked token: {refreshToken}");
            await _context.SaveChangesAsync();
            throw new InvalidOperationException("Invalid token.");
        }

        if (!tokenEntity.IsActive)
        {
            throw new InvalidOperationException("Invalid or expired token.");
        }

        var newRefreshToken = RotateRefreshToken(tokenEntity, ipAddress);
        user.RefreshTokens.Add(newRefreshToken);

        await _context.SaveChangesAsync();

        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user.Id, user.Email, user.Username);
        var response = new AuthResponseDto(accessToken, user.Username, user.Email);

        return (response, newRefreshToken.Token);
    }

    public async Task RevokeTokenAsync(string refreshToken, string ipAddress)
    {
        var user = await _context.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == refreshToken));

        if (user == null)
        {
            throw new InvalidOperationException("Invalid token.");
        }

        var tokenEntity = user.RefreshTokens.Single(t => t.Token == refreshToken);

        if (!tokenEntity.IsActive)
        {
            throw new InvalidOperationException("Invalid token.");
        }

        tokenEntity.RevokedAt = DateTime.UtcNow;
        tokenEntity.RevokedByIp = ipAddress;

        await _context.SaveChangesAsync();
    }

    private RefreshToken RotateRefreshToken(RefreshToken refreshToken, string ipAddress)
    {
        var newRefreshTokenString = _jwtTokenGenerator.GenerateRefreshToken();
        var newRefreshToken = new RefreshToken
        {
            Token = newRefreshTokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = ipAddress
        };

        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.RevokedByIp = ipAddress;
        refreshToken.ReplacedByToken = newRefreshToken.Token;

        return newRefreshToken;
    }

    private void RevokeDescendantRefreshTokens(RefreshToken refreshToken, User user, string ipAddress, string reason)
    {
        if (string.IsNullOrEmpty(refreshToken.ReplacedByToken))
        {
            return;
        }

        var childToken = user.RefreshTokens.SingleOrDefault(t => t.Token == refreshToken.ReplacedByToken);
        if (childToken != null)
        {
            if (childToken.IsActive)
            {
                childToken.RevokedAt = DateTime.UtcNow;
                childToken.RevokedByIp = ipAddress;
            }
            RevokeDescendantRefreshTokens(childToken, user, ipAddress, reason);
        }
    }
}
