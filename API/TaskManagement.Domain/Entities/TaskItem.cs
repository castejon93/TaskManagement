using TaskManagement.Domain.Exceptions;

namespace TaskManagement.Domain.Entities;

/// <summary>Central domain entity representing a task. Maps to <c>dbo.Tasks</c>.</summary>
public class TaskItem
{
    public int Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public int StatusId { get; private set; }     
    public int UserId { get; private set; }
    public string? AdditionalInfo { get; private set; }   // JSON column
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Navigation properties
    public TaskStatusItem Status { get; private set; } = null!;
    public User User { get; private set; } = null!;

    private TaskItem() { }

    /// <summary>
    /// Factory method that creates a <see cref="TaskItem"/> in a valid initial state.
    /// </summary>
    /// <param name="title">Task title (max 200 characters).</param>
    /// <param name="description">Optional task description.</param>
    /// <param name="statusId">Initial status ID (always Pending = 1).</param>
    /// <param name="userId">ID of the user assigned to this task.</param>
    /// <param name="additionalInfo">Optional free-form metadata serialized as a JSON string.</param>
    public static TaskItem Create(string title, string? description, int statusId, int userId, string? additionalInfo)
    {
        return new TaskItem
        {
            Title = title,
            Description = description,
            StatusId = statusId,
            UserId = userId,
            AdditionalInfo = additionalInfo,
            CreatedAt = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Advances the task to a new status, enforcing the sequential transition rule.
    /// </summary>
    /// <param name="newStatusId">The ID of the target status.</param>
    /// <param name="currentSortOrder">The <c>SortOrder</c> of the current status.</param>
    /// <param name="newSortOrder">The <c>SortOrder</c> of the target status — must equal <paramref name="currentSortOrder"/> + 1.</param>
    /// <exception cref="InvalidStatusTransitionException">Thrown when the transition is not sequential.</exception>
    public void ChangeStatus(int newStatusId, int currentSortOrder, int newSortOrder)
    {
        // Business rule: cannot skip directly from Pending (1) to Done (3).
        if (newSortOrder != currentSortOrder + 1)
            throw new InvalidStatusTransitionException(StatusId, newStatusId);

        StatusId = newStatusId;
        UpdatedAt = DateTime.UtcNow;
    }
}