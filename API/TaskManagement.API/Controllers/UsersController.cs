using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs.Users;
using TaskManagement.Application.Services;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/users")]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly IValidator<CreateUserRequest> _validator;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        UserService userService,
        IValidator<CreateUserRequest> validator,
        ILogger<UsersController> logger)
    {
        _userService = userService;
        _validator = validator;
        _logger = logger;
    }

    /// <summary>
    /// Returns all users. Used by the frontend to populate the task assignment dropdown.
    /// </summary>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>200 OK with a list of <see cref="UserResponse"/>.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var users = await _userService.GetAllAsync(cancellationToken);
        return Ok(users);
    }

    /// <summary>
    /// Creates a new user. The email address must be unique across all users.
    /// </summary>
    /// <param name="request">User display name and email address.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>201 Created with the created <see cref="UserResponse"/>, or 409 Conflict if the email is already registered.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        [FromBody] CreateUserRequest request,
        CancellationToken cancellationToken)
    {
        // Validate the request before calling the service.
        await _validator.ValidateAndThrowAsync(request, cancellationToken);

        _logger.LogInformation("Creating user with email {Email}.", request.Email);
        var created = await _userService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }
}