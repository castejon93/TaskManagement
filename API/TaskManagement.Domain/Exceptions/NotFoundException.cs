namespace TaskManagement.Domain.Exceptions;

/// <summary>Thrown when a requested entity does not exist in the database. Maps to HTTP 404 Not Found.</summary>
public sealed class NotFoundException : DomainException
{
    public NotFoundException(string entityName, object key)
        : base($"{entityName} with id '{key}' was not found.") { }
}