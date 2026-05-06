using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces;

/// <summary>Contract for task status reference data access.</summary>
public interface ITaskStatusRepository
{
    /// <summary>Returns a status by primary key, or <see langword="null"/> if not found.</summary>
    Task<TaskStatusItem?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>Returns all statuses ordered by <c>SortOrder</c> ascending.</summary>
    Task<IEnumerable<TaskStatusItem>> GetAllAsync(CancellationToken cancellationToken = default);
}