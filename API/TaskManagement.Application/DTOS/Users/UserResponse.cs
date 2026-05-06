namespace TaskManagement.Application.DTOs.Users;

/// <summary>
/// Response payload returned to the client after reading or creating a user.
/// </summary>
/// <param name="Id">Unique identifier of the user.</param>
/// <param name="Name">Full display name of the user.</param>
/// <param name="Email">Email address of the user.</param>
/// <param name="CreatedAt">UTC timestamp when the user record was created.</param>
public record UserResponse(int Id, string Name, string Email, DateTime CreatedAt);