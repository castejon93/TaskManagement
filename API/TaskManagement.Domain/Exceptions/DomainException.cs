namespace TaskManagement.Domain.Exceptions;

/// <summary>
/// Base class for all domain-level business rule violations.
/// Using a custom exception hierarchy allows the global middleware to map each type to the correct HTTP status code.
/// </summary>
public abstract class DomainException : Exception
{
    protected DomainException(string message) : base(message) { }
}