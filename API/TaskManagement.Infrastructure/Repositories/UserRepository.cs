using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Persistence;

namespace TaskManagement.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly TaskManagementDbContext _db;

    public UserRepository(TaskManagementDbContext db) => _db = db;

    /// <summary>Returns all users as an untracked read-only list.</summary>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>An untracked read-only list of all <see cref="User"/> entities.</returns>
    public async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken) =>
        await _db.Users.AsNoTracking().ToListAsync(cancellationToken);

    /// <summary>Returns a user by primary key.</summary>
    /// <param name="id">Primary key of the user.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>The matching <see cref="User"/>.</returns>
    public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken) =>
        await _db.Users.FindAsync(new object[] { id }, cancellationToken);

    /// <summary>Returns the user whose email matches the given value.</summary>
    /// <param name="email">The email address to search for (case-insensitive via database collation).</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>The matching <see cref="User"/>.</returns>
    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken) =>
        await _db.Users.AsNoTracking()
                       .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    /// <summary>Adds a user to the change tracker and persists it to the database.</summary>
    /// <param name="user">The new user entity to persist.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>The persisted <see cref="User"/> with its database-generated ID populated.</returns>
    public async Task<User> AddAsync(User user, CancellationToken cancellationToken)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);
        return user;
    }
}