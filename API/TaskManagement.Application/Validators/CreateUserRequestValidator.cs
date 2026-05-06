using FluentValidation;
using TaskManagement.Application.DTOs.Users;

namespace TaskManagement.Application.Validators;

/// <summary>
/// FluentValidation validator for <see cref="CreateUserRequest"/>. Ensures the name and
/// email are non-empty, the email is in a valid format, and both fields respect their
/// maximum length limits. Validation errors are caught by <c>GlobalExceptionMiddleware</c>
/// and returned as HTTP 400.
/// </summary>
public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Email must be a valid email address.")
            .MaximumLength(150).WithMessage("Email cannot exceed 150 characters.");
    }
}