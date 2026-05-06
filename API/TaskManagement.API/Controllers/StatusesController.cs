using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs.Statuses;
using TaskManagement.Application.Services;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/statuses")]
[Produces("application/json")]
public class StatusesController : ControllerBase
{
    private readonly TaskStatusService _taskStatusService;
    private readonly ILogger<StatusesController> _logger;

    public StatusesController(
        TaskStatusService taskStatusService,
        ILogger<StatusesController> logger)
    {
        _taskStatusService = taskStatusService;
        _logger = logger;
    }

    /// <summary>
    /// Returns all task statuses ordered by sort order.
    /// Used by the frontend to populate the status filter dropdown and determine valid status transitions.
    /// </summary>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>200 OK with a list of <see cref="TaskStatusResponse"/>.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TaskStatusResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var statuses = await _taskStatusService.GetAllAsync(cancellationToken);
        return Ok(statuses);
    }
}
