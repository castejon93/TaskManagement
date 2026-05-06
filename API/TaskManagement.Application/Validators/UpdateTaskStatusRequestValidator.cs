using FluentValidation;
using TaskManagement.Application.DTOs.Tasks;

namespace TaskManagement.Application.Validators;

/// <summary>
/// FluentValidation validator for <see cref="UpdateTaskStatusRequest"/>. Ensures the
/// target status ID is a positive integer. Validation errors are caught by
/// <c>GlobalExceptionMiddleware</c> and returned as HTTP 400.
/// </summary>
public class UpdateTaskStatusRequestValidator : AbstractValidator<UpdateTaskStatusRequest>
{
    public UpdateTaskStatusRequestValidator()
    {
        RuleFor(x => x.NewStatusId)
            .GreaterThan(0).WithMessage("NewStatusId must be a positive integer.");
    }
}