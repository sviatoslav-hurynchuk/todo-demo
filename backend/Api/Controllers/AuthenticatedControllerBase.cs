using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace TodoApp.Api.Controllers;

public abstract class AuthenticatedControllerBase : ControllerBase
{
    protected int GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(value, out var userId))
        {
            throw new InvalidOperationException("Authenticated user is missing a valid identifier claim.");
        }
        return userId;
    }
}
