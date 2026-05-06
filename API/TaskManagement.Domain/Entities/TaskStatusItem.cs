namespace TaskManagement.Domain.Entities;

/// <summary>
/// Reference entity for task statuses. Maps to <c>dbo.TaskStatus</c>.
/// Seed data: Pending (Id=1, SortOrder=1), InProgress (Id=2, SortOrder=2), Done (Id=3, SortOrder=3).
/// </summary>
public class TaskStatusItem
{
    public int Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public int SortOrder { get; private set; }
    public ICollection<TaskItem> Tasks { get; private set; } = new List<TaskItem>();
    private TaskStatusItem() { }
}