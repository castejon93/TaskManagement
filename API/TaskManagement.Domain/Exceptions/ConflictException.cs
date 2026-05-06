namespace TaskManagement.Domain.Exceptions;

/// <summary>Thrown when an operation violates a uniqueness rule (e.g. duplicate email). Maps to HTTP 409 Conflict.</summary>
public sealed class ConflictException : DomainException
{
    public ConflictException(string message) : base(message) { }
}
