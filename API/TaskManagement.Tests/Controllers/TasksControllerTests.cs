using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using TaskManagement.API.Controllers;
using TaskManagement.Application.DTOs.Tasks;
using TaskManagement.Application.Interfaces;
using TaskManagement.Application.Services;
using TaskManagement.Application.Validators;
using TaskManagement.Domain.Entities;
using TaskManagement.Tests.Helpers;

namespace TaskManagement.Tests.Controllers;

public class TasksControllerTests
{
    // Repositories needed to construct the concrete TaskService for Moq to override
    private readonly Mock<ITaskRepository>              _taskRepoMock   = new();
    private readonly Mock<IUserRepository>              _userRepoMock   = new();
    private readonly Mock<ITaskStatusRepository>        _statusRepoMock = new();
    private readonly Mock<TaskService>                  _serviceMock;
    private readonly Mock<IValidator<CreateTaskRequest>>        _createValidator = new();
    private readonly Mock<IValidator<UpdateTaskStatusRequest>>  _statusValidator = new();
    private readonly TasksController                    _sut;

    public TasksControllerTests()
    {
        _serviceMock = new Mock<TaskService>(
            _taskRepoMock.Object, _userRepoMock.Object, _statusRepoMock.Object);

        _sut = new TasksController(
            _serviceMock.Object,
            _createValidator.Object,
            _statusValidator.Object,
            NullLogger<TasksController>.Instance);
    }

    // ── Helper: configure validator behaviour ────────────────────────────────────

    /// <summary>Moq default for Task&lt;ValidationResult&gt; already returns new ValidationResult() (IsValid=true);
    /// this explicit setup is kept for readability but is not strictly required.</summary>
    private void SetupValidatorPass<T>(Mock<IValidator<T>> mock) where T : class
    {
        var ok = new FluentValidation.Results.ValidationResult();
        mock.Setup(v => v.ValidateAsync(It.IsAny<T>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(ok);
        mock.Setup(v => v.ValidateAsync(It.IsAny<ValidationContext<T>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(ok);
    }

    /// <summary>Throws ValidationException through both overloads FluentValidation may dispatch to.</summary>
    private void SetupValidatorFail<T>(Mock<IValidator<T>> mock, string error) where T : class
    {
        var ex = new FluentValidation.ValidationException(
            new[] { new ValidationFailure("Field", error) });
        mock.Setup(v => v.ValidateAsync(It.IsAny<T>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(ex);
        mock.Setup(v => v.ValidateAsync(It.IsAny<ValidationContext<T>>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(ex);
    }

    // ── GetAll ────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAll_Returns200OkWithTaskList()
    {
        // Arrange
        var tasks = new List<TaskResponse>
        {
            new(1, "Task A", null, 1, "Pending", 1, "Alice", null, DateTime.UtcNow, null),
            new(2, "Task B", null, 1, "Pending", 1, "Alice", null, DateTime.UtcNow, null),
        };
        _serviceMock.Setup(s => s.GetAllAsync(null, null, It.IsAny<CancellationToken>()))
                    .ReturnsAsync(tasks);

        // Act
        var result = await _sut.GetAll(null, null, CancellationToken.None);

        // Assert
        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.StatusCode.Should().Be(200);
        var body = ok.Value.Should().BeAssignableTo<IEnumerable<TaskResponse>>().Subject;
        body.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAll_PassesFiltersToService()
    {
        // Arrange
        _serviceMock.Setup(s => s.GetAllAsync(5, 2, It.IsAny<CancellationToken>()))
                    .ReturnsAsync([]);

        // Act
        await _sut.GetAll(5, 2, CancellationToken.None);

        // Assert
        _serviceMock.Verify(s => s.GetAllAsync(5, 2, It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── Create ────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_WithValidRequest_Returns201Created()
    {
        // Arrange
        SetupValidatorPass(_createValidator);
        var created = new TaskResponse(3, "New Task", null, 1, "Pending", 1, "Alice", null, DateTime.UtcNow, null);
        _serviceMock.Setup(s => s.CreateAsync(It.IsAny<CreateTaskRequest>(), It.IsAny<CancellationToken>()))
                    .ReturnsAsync(created);

        // Act
        var result = await _sut.Create(new CreateTaskRequest("New Task", null, 1, null), CancellationToken.None);

        // Assert
        var created201 = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        created201.StatusCode.Should().Be(201);
        created201.Value.Should().BeEquivalentTo(created);
    }

    [Fact]
    public async Task Create_WhenValidationFails_ThrowsValidationException()
    {
        // Use a real validator so ValidateAndThrowAsync actually throws on invalid input
        var sut = new TasksController(
            _serviceMock.Object,
            new CreateTaskRequestValidator(),
            _statusValidator.Object,
            NullLogger<TasksController>.Instance);

        var act = async () => await sut.Create(new CreateTaskRequest("", null, 0, null), CancellationToken.None);

        await act.Should().ThrowAsync<FluentValidation.ValidationException>();
    }

    // ── UpdateStatus ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateStatus_WithValidRequest_Returns200Ok()
    {
        // Arrange
        SetupValidatorPass(_statusValidator);
        var updated = new TaskResponse(1, "T", null, 2, "InProgress", 1, "Alice", null, DateTime.UtcNow, null);
        _serviceMock.Setup(s => s.UpdateStatusAsync(1, It.IsAny<UpdateTaskStatusRequest>(), It.IsAny<CancellationToken>()))
                    .ReturnsAsync(updated);

        // Act
        var result = await _sut.UpdateStatus(1, new UpdateTaskStatusRequest(2), CancellationToken.None);

        // Assert
        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.StatusCode.Should().Be(200);
        ok.Value.Should().BeEquivalentTo(updated);
    }

    [Fact]
    public async Task UpdateStatus_WhenValidationFails_ThrowsValidationException()
    {
        // Use a real validator so ValidateAndThrowAsync actually throws on invalid input
        var sut = new TasksController(
            _serviceMock.Object,
            _createValidator.Object,
            new UpdateTaskStatusRequestValidator(),
            NullLogger<TasksController>.Instance);

        var act = async () => await sut.UpdateStatus(1, new UpdateTaskStatusRequest(0), CancellationToken.None);

        await act.Should().ThrowAsync<FluentValidation.ValidationException>();
    }
}
