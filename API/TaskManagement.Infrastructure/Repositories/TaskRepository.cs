using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Persistence;

namespace TaskManagement.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly TaskManagementDbContext _db;

    public TaskRepository(TaskManagementDbContext db) => _db = db;

    /// <summary>
    /// Returns all tasks with <c>Status</c> and <c>User</c> navigations loaded.
    /// Applies optional userId and statusId filters, ordered by <c>CreatedAt</c> descending.
    /// </summary>
    /// <param name="userId">Optional user ID filter.</param>
    /// <param name="statusId">Optional status ID filter.</param>
    /// <param name="cancellationToken">Request cancellation token</param>
    /// <returns>An untracked, ordered collection of <see cref="TaskItem"/> entities.</returns>
    public async Task<IEnumerable<TaskItem>> GetAllAsync(
        int? userId, int? statusId, CancellationToken cancellationToken)
    {
        var query = _db.Tasks
                       .AsNoTracking()
                       .Include(t => t.Status)
                       .Include(t => t.User)
                       .AsQueryable();

        if (userId.HasValue)
            query = query.Where(t => t.UserId == userId.Value);

        if (statusId.HasValue)
            query = query.Where(t => t.StatusId == statusId.Value);

        return await query.OrderByDescending(t => t.CreatedAt).ToListAsync(cancellationToken);
    }

    /// <summary>Returns a task by ID with</summary>
    /// <param name="id">Primary key of the task.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>The matching <see cref="TaskItem"/> with navigations.</returns>
    public async Task<TaskItem?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        await _db.Tasks
                 .Include(t => t.Status)
                 .Include(t => t.User)
                 .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    /// <summary>Adds a task to the change tracker and persists it to the database.</summary>
    /// <param name="task">The new task entity to persist.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>The persisted <see cref="TaskItem"/> with its database-generated ID populated.</returns>
    public async Task<TaskItem> AddAsync(TaskItem task, CancellationToken cancellationToken)
    {
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync(cancellationToken);
        return task;
    }

    /// <summary>Marks an existing task as modified and persists the changes to the database.</summary>
    /// <param name="task">The modified task entity to persist.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    public async Task UpdateAsync(TaskItem task, CancellationToken cancellationToken)
    {
        _db.Tasks.Update(task);
        await _db.SaveChangesAsync(cancellationToken);
    }
}