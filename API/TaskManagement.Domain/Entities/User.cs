namespace TaskManagement.Domain.Entities;

/// <summary>Represents a collaborator who can be assigned tasks. Maps to <c>dbo.Users</c>.</summary>
public class User
{
    public int Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }
    public ICollection<TaskItem> Tasks { get; private set; } = new List<TaskItem>();

    private User() { }

    /// <summary>
    /// Factory method that creates a <see cref="User"/> in a valid initial state.
    /// </summary>
    /// <param name="name">The user's display name (max 100 characters).</param>
    /// <param name="email">The user's unique email address (max 150 characters).</param>
    public static User Create(string name, string email)
    {
        return new User
        {
            Name = name,
            Email = email,
            CreatedAt = DateTime.UtcNow
        };
    }
}