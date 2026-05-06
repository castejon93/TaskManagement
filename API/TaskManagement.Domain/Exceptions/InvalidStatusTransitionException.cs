namespace TaskManagement.Domain.Exceptions;

/// <summary>Thrown when a task status change violates the sequential transition rule. Maps to HTTP 422 Unprocessable Entity.</summary>
public sealed class InvalidStatusTransitionException : DomainException
{
    public InvalidStatusTransitionException(int fromStatusId, int toStatusId)
        : base($"Invalid status transition from status id {fromStatusId} to status id {toStatusId}. Transitions must be sequential.") { }
}