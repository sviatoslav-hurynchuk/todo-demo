using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApp.Interfaces;
using TodoApp.Interfaces.DTOs;

namespace TodoApp.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : AuthenticatedControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<TaskDto>>> GetAll(
        [FromQuery, Range(1, 21474837)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] bool? isCompleted = null,
        [FromQuery] bool? isImportant = null,
        [FromQuery] int? categoryId = null)
    {
        var result = await _taskService.GetAllAsync(GetUserId(), page, pageSize, search, isCompleted, isImportant, categoryId);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskDto>> GetById(int id)
    {
        var task = await _taskService.GetByIdAsync(id, GetUserId());
        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create([FromBody] CreateTaskDto dto)
    {
        var task = await _taskService.CreateAsync(dto, GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskDto>> Update(int id, [FromBody] UpdateTaskDto dto)
    {
        var task = await _taskService.UpdateAsync(id, dto, GetUserId());
        return Ok(task);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _taskService.DeleteAsync(id, GetUserId());
        return NoContent();
    }

    [HttpPatch("{id:int}/toggle")]
    public async Task<ActionResult<TaskDto>> ToggleComplete(int id)
    {
        var task = await _taskService.ToggleCompleteAsync(id, GetUserId());
        return Ok(task);
    }
}
