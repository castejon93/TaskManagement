using TaskManagement.Application.DTOs.Statuses;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.Application.Services;

public class TaskStatusService
{
    private readonly ITaskStatusRepository _taskStatusRepository;

    public TaskStatusService(ITaskStatusRepository taskStatusRepository)
    {
        _taskStatusRepository = taskStatusRepository;
    }

    /// <summary>
    /// Returns all task statuses mapped to response DTOs, ordered by <c>SortOrder</c> ascending.
    /// </summary>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>A sequence of <see cref="TaskStatusResponse"/> DTOs ordered by <c>SortOrder</c>.</returns>
    public virtual async Task<IEnumerable<TaskStatusResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var statuses = await _taskStatusRepository.GetAllAsync(cancellationToken);
        return statuses.Select(MapToResponse);
    }

    private static TaskStatusResponse MapToResponse(Domain.Entities.TaskStatusItem s) =>
        new(s.Id, s.Name, s.Description, s.SortOrder);
}
