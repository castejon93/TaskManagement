namespace TaskManagement.Application.DTOs.Tasks;

/// <summary>
/// Request payload sent by the client when advancing a task to a new status.
/// </summary>
/// <param name="NewStatusId">ID of the target status. Must be the immediately next sequential status — skipping is not allowed.</param>
public record UpdateTaskStatusRequest(int NewStatusId);