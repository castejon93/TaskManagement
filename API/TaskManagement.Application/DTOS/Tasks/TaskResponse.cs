namespace TaskManagement.Application.DTOs.Tasks;

/// <summary>
/// Response payload returned to the client after reading or creating a task.
/// </summary>
/// <param name="Id">Unique identifier of the task.</param>
/// <param name="Title">Short label describing the task.</param>
/// <param name="Description">Optional extended details about the task.</param>
/// <param name="StatusId">ID of the current workflow status.</param>
/// <param name="StatusName">Display name of the current workflow status.</param>
/// <param name="UserId">ID of the assigned user.</param>
/// <param name="UserName">Display name of the assigned user.</param>
/// <param name="AdditionalInfo">Optional JSON string containing custom metadata fields, or <see langword="null"/>.</param>
/// <param name="CreatedAt">UTC timestamp when the task was created.</param>
/// <param name="UpdatedAt">UTC timestamp of the last status change, or <see langword="null"/> if the task has never been updated.</param>
public record TaskResponse(
    int Id,
    string Title,
    string? Description,
    int StatusId,
    string StatusName,
    int UserId,
    string UserName,
    string? AdditionalInfo,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);