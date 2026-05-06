using TaskManagement.Application.DTOs.Tasks;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Exceptions;

namespace TaskManagement.Application.Services;

public class TaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITaskStatusRepository _statusRepository;

    public TaskService(
        ITaskRepository taskRepository,
        IUserRepository userRepository,
        ITaskStatusRepository statusRepository)
    {
        _taskRepository = taskRepository;
        _userRepository = userRepository;
        _statusRepository = statusRepository;
    }

    /// <summary>
    /// Returns all tasks, optionally filtered by user and/or status, ordered by creation date descending.
    /// </summary>
    /// <param name="userId">Optional user ID filter.</param>
    /// <param name="statusId">Optional status ID filter.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>A sequence of <see cref="TaskResponse"/> DTOs.</returns>
    public virtual async Task<IEnumerable<TaskResponse>> GetAllAsync(
        int? userId, int? statusId, CancellationToken cancellationToken)
    {
        var tasks = await _taskRepository.GetAllAsync(userId, statusId, cancellationToken);
        return tasks.Select(MapToResponse);
    }

    /// <summary>
    /// Creates a new task. The status is always set to <c>Pending</c> (StatusId = 1) on creation.
    /// </summary>
    /// <param name="request">The task creation request including title, description, user assignment, and optional metadata.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <exception cref="NotFoundException">Thrown when the assigned user does not exist.</exception>
    /// <returns>The newly created task as a <see cref="TaskResponse"/>.</returns>
    public virtual async Task<TaskResponse> CreateAsync(CreateTaskRequest request, CancellationToken cancellationToken)
    {
        // Validate the assigned user exists.
        User user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException(nameof(User), request.UserId);

        // New tasks always start as Pending (seed Id = 1).
        const int pendingStatusId = 1;

        var task = TaskItem.Create(
            request.Title,
            request.Description,
            pendingStatusId,
            request.UserId,
            request.AdditionalInfo);

        var created = await _taskRepository.AddAsync(task, cancellationToken);

        // Reload with navigations to build the full response.
        var full = await _taskRepository.GetByIdAsync(created.Id, cancellationToken)!;
        return MapToResponse(full!);
    }

    /// <summary>
    /// Advances a task to a new status. Enforces the sequential transition rule — no skipping statuses.
    /// </summary>
    /// <param name="taskId">The ID of the task to update.</param>
    /// <param name="request">Contains the target status ID.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <exception cref="NotFoundException">Thrown when the task or a status record does not exist.</exception>
    /// <exception cref="InvalidStatusTransitionException">Thrown when the transition is not sequential.</exception>
    /// <returns>The updated task as a <see cref="TaskResponse"/>.</returns>
    public virtual async Task<TaskResponse> UpdateStatusAsync(
        int taskId, UpdateTaskStatusRequest request, CancellationToken cancellationToken)
    {
        TaskItem task = await _taskRepository.GetByIdAsync(taskId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskItem), taskId);

        TaskStatusItem currentStatus = await _statusRepository.GetByIdAsync(task.StatusId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskStatusItem), task.StatusId);

        TaskStatusItem newStatus = await _statusRepository.GetByIdAsync(request.NewStatusId, cancellationToken)
            ?? throw new NotFoundException(nameof(TaskStatusItem), request.NewStatusId);

        // Domain entity validates the business rule (sequential transition).
        task.ChangeStatus(newStatus.Id, currentStatus.SortOrder, newStatus.SortOrder);

        await _taskRepository.UpdateAsync(task, cancellationToken);

        var updated = await _taskRepository.GetByIdAsync(taskId, cancellationToken);
        return MapToResponse(updated!);
    }

    private static TaskResponse MapToResponse(TaskItem task) =>
        new(task.Id, task.Title, task.Description, task.StatusId, task.Status.Name,
            task.UserId, task.User.Name, task.AdditionalInfo, task.CreatedAt, task.UpdatedAt);
}