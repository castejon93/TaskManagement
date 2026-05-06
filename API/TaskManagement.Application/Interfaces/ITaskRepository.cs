using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces;

/// <summary>Contract for task data access. The Application layer never references EF Core directly.</summary>
public interface ITaskRepository
{
    /// <summary>Returns tasks with <c>Status</c> and <c>User</c> navigations loaded, optionally filtered, ordered by <c>CreatedAt</c> descending.</summary>
    Task<IEnumerable<TaskItem>> GetAllAsync(int? userId, int? statusId, CancellationToken cancellationToken = default);

    /// <summary>Returns a single task by ID with navigations loaded, or <see langword="null"/> if not found.</summary>
    Task<TaskItem?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>Persists a new task and returns the tracked entity.</summary>
    Task<TaskItem> AddAsync(TaskItem task, CancellationToken cancellationToken = default);

    /// <summary>Persists changes to an existing tracked task.</summary>
    Task UpdateAsync(TaskItem task, CancellationToken cancellationToken = default);
}