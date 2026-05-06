using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces;

/// <summary>Contract for user data access. The Application layer never references EF Core directly.</summary>
public interface IUserRepository
{
    /// <summary>Returns all users, untracked.</summary>
    Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Returns a user by primary key, or <see langword="null"/> if not found.</summary>
    Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>Returns the user whose email matches the given value (case-insensitive), or <see langword="null"/> if not found.</summary>
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>Persists a new user and returns the tracked entity.</summary>
    Task<User> AddAsync(User user, CancellationToken cancellationToken = default);
}