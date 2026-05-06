using FluentValidation;
using TaskManagement.Application.DTOs.Tasks;

namespace TaskManagement.Application.Validators;

/// <summary>
/// FluentValidation validator for <see cref="CreateTaskRequest"/>. Ensures the title is
/// non-empty, the assigned user ID is positive, and <c>AdditionalInfo</c> — when provided
/// — is syntactically valid JSON. Validation errors are caught by
/// <c>GlobalExceptionMiddleware</c> and returned as HTTP 400.
/// </summary>
public class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters.");

        RuleFor(x => x.UserId)
            .GreaterThan(0).WithMessage("A valid UserId is required.");

        // If AdditionalInfo is provided, it must be a valid JSON string.
        RuleFor(x => x.AdditionalInfo)
            .Must(BeValidJsonOrNull)
            .WithMessage("AdditionalInfo must be a valid JSON string when provided.");
    }

    /// <summary>
    /// Returns <see langword="true"/> when <paramref name="value"/> is
    /// <see langword="null"/> or a syntactically valid JSON string.
    /// </summary>
    /// <param name="value">The string to validate.</param>
    /// <returns>
    /// <see langword="true"/> if <paramref name="value"/> is <see langword="null"/> or valid JSON;
    /// otherwise <see langword="false"/>.
    /// </returns>
    private static bool BeValidJsonOrNull(string? value)
    {
        if (value is null) return true;
        try
        {
            System.Text.Json.JsonDocument.Parse(value);
            return true;
        }
        catch
        {
            return false;
        }
    }
}