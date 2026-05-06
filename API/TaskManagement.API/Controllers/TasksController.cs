using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs.Tasks;
using TaskManagement.Application.Services;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/tasks")]
[Produces("application/json")]
public class TasksController : ControllerBase
{
    private readonly TaskService _taskService;
    private readonly IValidator<CreateTaskRequest> _createValidator;
    private readonly IValidator<UpdateTaskStatusRequest> _statusValidator;
    private readonly ILogger<TasksController> _logger;

    public TasksController(
        TaskService taskService,
        IValidator<CreateTaskRequest> createValidator,
        IValidator<UpdateTaskStatusRequest> statusValidator,
        ILogger<TasksController> logger)
    {
        _taskService = taskService;
        _createValidator = createValidator;
        _statusValidator = statusValidator;
        _logger = logger;
    }

    /// <summary>
    /// Returns all tasks, optionally filtered by assigned user and/or status.
    /// Results are ordered by creation date descending.
    /// </summary>
    /// <param name="userId">Optional filter: only tasks assigned to this user ID.</param>
    /// <param name="statusId">Optional filter: only tasks with this status ID.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>200 OK with a list of <see cref="TaskResponse"/>.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TaskResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? userId,
        [FromQuery] int? statusId,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Retrieving tasks. UserId={UserId}, StatusId={StatusId}.", userId, statusId);
        var tasks = await _taskService.GetAllAsync(userId, statusId, cancellationToken);
        return Ok(tasks);
    }

    /// <summary>
    /// Creates a new task. The initial status is always set to <c>Pending</c> automatically.
    /// </summary>
    /// <param name="request">Title, optional description, assigned user ID, and optional additional metadata (JSON).</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>201 Created with the created <see cref="TaskResponse"/>.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Create(
        [FromBody] CreateTaskRequest request,
        CancellationToken cancellationToken)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);

        _logger.LogInformation("Creating task '{Title}' for UserId={UserId}.", request.Title, request.UserId);
        var created = await _taskService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    /// <summary>
    /// Advances a task to a new status. Transitions must be sequential — skipping statuses is not allowed.
    /// </summary>
    /// <param name="id">The ID of the task to update.</param>
    /// <param name="request">The target status ID.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>200 OK with the updated <see cref="TaskResponse"/>.</returns>
    [HttpPut("{id:int}/status")]
    [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> UpdateStatus(
        int id,
        [FromBody] UpdateTaskStatusRequest request,
        CancellationToken cancellationToken)
    {
        await _statusValidator.ValidateAndThrowAsync(request, cancellationToken);

        _logger.LogInformation("Updating status of task {TaskId} to StatusId={StatusId}.", id, request.NewStatusId);
        var updated = await _taskService.UpdateStatusAsync(id, request, cancellationToken);

        return Ok(updated);
    }
}