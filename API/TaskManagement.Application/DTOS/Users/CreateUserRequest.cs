namespace TaskManagement.Application.DTOs.Users;

/// <summary>
/// Request payload sent by the client when creating a new user.
/// </summary>
/// <param name="Name">Full display name for the new user. Maximum 100 characters.</param>
/// <param name="Email">Unique email address for the new user. Maximum 150 characters.</param>
public record CreateUserRequest(string Name, string Email);