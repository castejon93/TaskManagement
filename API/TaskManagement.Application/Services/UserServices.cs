using TaskManagement.Application.DTOs.Users;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Exceptions;

namespace TaskManagement.Application.Services;

public class UserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    /// <summary>
    /// Returns all users mapped to response DTOs.
    /// </summary>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>A sequence of <see cref="UserResponse"/> DTOs.</returns>
    public virtual async Task<IEnumerable<UserResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        return users.Select(MapToResponse);
    }

    /// <summary>
    /// Creates a new user after verifying the email address is not already registered.
    /// </summary>
    /// <param name="request">The user creation request containing name and email.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <exception cref="ConflictException">Thrown when a user with the same email already exists.</exception>
    /// <returns>The newly created user as a <see cref="UserResponse"/>.</returns>
    public virtual async Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken)
    {
        // Enforce uniqueness at the service layer (the DB constraint is the safety net).
        var existing = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existing is not null)
            throw new ConflictException($"A user with email '{request.Email}' already exists.");

        var user = User.Create(request.Name, request.Email);
        var created = await _userRepository.AddAsync(user, cancellationToken);
        return MapToResponse(created);
    }

    private static UserResponse MapToResponse(User u) =>
        new(u.Id, u.Name, u.Email, u.CreatedAt);
}