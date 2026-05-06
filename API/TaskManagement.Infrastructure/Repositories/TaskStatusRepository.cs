using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Persistence;

namespace TaskManagement.Infrastructure.Repositories;

public class TaskStatusRepository : ITaskStatusRepository
{
    private readonly TaskManagementDbContext _db;

    public TaskStatusRepository(TaskManagementDbContext db) => _db = db;

    /// <summary>Returns a status by primary key (untracked).</summary>
    /// <param name="id">Primary key of the status.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>The matching <see cref="TaskStatusItem"/>.</returns>
    public async Task<TaskStatusItem?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        await _db.TaskStatus.AsNoTracking()
                            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

    /// <summary>Returns all statuses ordered by <c>SortOrder</c> ascending (untracked).</summary>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>An untracked collection of all <see cref="TaskStatusItem"/> entities ordered by <c>SortOrder</c>.</returns>
    public async Task<IEnumerable<TaskStatusItem>> GetAllAsync(CancellationToken cancellationToken) =>
        await _db.TaskStatus.AsNoTracking()
                            .OrderBy(s => s.SortOrder)
                            .ToListAsync(cancellationToken);
}