namespace TaskManagement.Application.DTOs.Statuses;

/// <summary>
/// Response payload representing a single task status option.
/// </summary>
/// <param name="Id">Unique identifier of the status.</param>
/// <param name="Name">Short status label (e.g. <c>Pending</c>, <c>InProgress</c>, <c>Done</c>).</param>
/// <param name="Description">Optional human-readable description of the status, or <see langword="null"/>.</param>
/// <param name="SortOrder">Numeric order used by the application to enforce valid sequential transitions.</param>
public sealed record TaskStatusResponse(int Id, string Name, string? Description, int SortOrder);
