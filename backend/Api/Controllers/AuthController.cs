using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TodoApp.Interfaces;
using TodoApp.Interfaces.DTOs;

namespace TodoApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("auth")]
public class AuthController : AuthenticatedControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto, GetIpAddress());
        if (!result.IsSuccess)
        {
            return BadRequest(new { message = result.Error });
        }

        SetRefreshTokenCookie(result.Value.RefreshToken);
        return Ok(result.Value.Response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto, GetIpAddress());
        if (!result.IsSuccess)
        {
            return BadRequest(new { message = result.Error });
        }

        SetRefreshTokenCookie(result.Value.RefreshToken);
        return Ok(result.Value.Response);
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return BadRequest(new { message = "Refresh token is required." });
        }

        var result = await _authService.RefreshTokenAsync(refreshToken, GetIpAddress());
        if (!result.IsSuccess)
        {
            return BadRequest(new { message = result.Error });
        }

        SetRefreshTokenCookie(result.Value.RefreshToken);
        return Ok(result.Value.Response);
    }

    [Authorize]
    [HttpPost("revoke-token")]
    public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenRequest? request)
    {
        var token = request?.Token ?? Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(token))
        {
            return BadRequest(new { message = "Token is required." });
        }

        var result = await _authService.RevokeTokenAsync(token, GetIpAddress(), GetUserId());
        if (!result.IsSuccess)
        {
            return BadRequest(new { message = result.Error });
        }

        Response.Cookies.Delete("refreshToken");
        return Ok(new { message = "Token revoked successfully." });
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = DateTime.UtcNow.AddDays(7),
            SameSite = SameSiteMode.Strict,
            Secure = true,
            IsEssential = true
        };
        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    private string GetIpAddress()
    {
        return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "127.0.0.1";
    }
}
