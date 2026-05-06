namespace TaskManagement.Application.DTOs.Tasks;

/// <summary>
/// Request payload sent by the client when creating a new task.
/// </summary>
/// <param name="Title">Short mandatory label for the task. Cannot be blank. Maximum 200 characters.</param>
/// <param name="Description">Optional extended details about the task.</param>
/// <param name="UserId">ID of the user to whom the task is assigned. Must be a positive integer.</param>
/// <param name="AdditionalInfo">Optional JSON string for custom metadata fields. Must be syntactically valid JSON when provided.</param>
public record CreateTaskRequest(
    string Title,
    string? Description,
    int UserId,
    string? AdditionalInfo
);