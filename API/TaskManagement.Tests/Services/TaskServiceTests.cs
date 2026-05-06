using FluentAssertions;
using Moq;
using TaskManagement.Application.DTOs.Tasks;
using TaskManagement.Application.Interfaces;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Exceptions;
using TaskManagement.Tests.Helpers;

namespace TaskManagement.Tests.Services;

public class TaskServiceTests
{
    private readonly Mock<ITaskRepository>       _taskRepoMock   = new();
    private readonly Mock<IUserRepository>       _userRepoMock   = new();
    private readonly Mock<ITaskStatusRepository> _statusRepoMock = new();
    private readonly TaskService                 _sut;

    public TaskServiceTests()
    {
        _sut = new TaskService(_taskRepoMock.Object, _userRepoMock.Object, _statusRepoMock.Object);
    }

    // ── GetAllAsync ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllAsync_ReturnsMappedResponses()
    {
        // Arrange
        var user   = User.Create("Alice", "alice@example.com");
        var status = EntityBuilder.BuildStatus(1, "Pending", 1);
        var tasks  = new List<TaskItem>
        {
            EntityBuilder.BuildTask(1, "Task A", 1, user, 1, status),
            EntityBuilder.BuildTask(2, "Task B", 1, user, 1, status),
        };

        _taskRepoMock.Setup(r => r.GetAllAsync(null, null, It.IsAny<CancellationToken>()))
                     .ReturnsAsync(tasks);

        // Act
        var result = await _sut.GetAllAsync(null, null, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result.Select(t => t.Title).Should().Contain(["Task A", "Task B"]);
    }

    [Fact]
    public async Task GetAllAsync_PassesFiltersToRepository()
    {
        // Arrange
        _taskRepoMock.Setup(r => r.GetAllAsync(42, 2, It.IsAny<CancellationToken>()))
                     .ReturnsAsync([]);

        // Act
        await _sut.GetAllAsync(42, 2, CancellationToken.None);

        // Assert — repo was called with the exact filters
        _taskRepoMock.Verify(r => r.GetAllAsync(42, 2, It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── CreateAsync ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_WhenUserNotFound_ThrowsNotFoundException()
    {
        // Arrange
        _userRepoMock.Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>()))
                     .ReturnsAsync((User?)null);

        var request = new CreateTaskRequest("My Task", null, 99, null);

        // Act
        var act = async () => await _sut.CreateAsync(request, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage("*99*");
    }

    [Fact]
    public async Task CreateAsync_WithValidRequest_AddsTaskAndReturnsResponse()
    {
        // Arrange
        var user   = User.Create("Alice", "alice@example.com");
        var status = EntityBuilder.BuildStatus(1, "Pending", 1);
        var created = EntityBuilder.BuildTask(7, "New Task", 1, user, 1, status);

        _userRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                     .ReturnsAsync(user);
        _taskRepoMock.Setup(r => r.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(created);
        _taskRepoMock.Setup(r => r.GetByIdAsync(7, It.IsAny<CancellationToken>()))
                     .ReturnsAsync(created);

        // Act
        var result = await _sut.CreateAsync(new CreateTaskRequest("New Task", null, 1, null), CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be("New Task");
        result.StatusId.Should().Be(1);
        _taskRepoMock.Verify(r => r.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithAdditionalInfo_SerializesJsonCorrectly()
    {
        // Arrange
        var user   = User.Create("Bob", "bob@example.com");
        var status = EntityBuilder.BuildStatus(1, "Pending", 1);
        var json   = """{"customFields":{"team":"backend"}}""";
        var created = EntityBuilder.BuildTask(3, "Task With Meta", 1, user, 1, status, additionalInfo: json);

        _userRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _taskRepoMock.Setup(r => r.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>())).ReturnsAsync(created);
        _taskRepoMock.Setup(r => r.GetByIdAsync(3, It.IsAny<CancellationToken>())).ReturnsAsync(created);

        // Act
        var result = await _sut.CreateAsync(new CreateTaskRequest("Task With Meta", null, 1, json), CancellationToken.None);

        // Assert
        result.AdditionalInfo.Should().Be(json);
    }

    // ── UpdateStatusAsync ────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateStatusAsync_WhenTaskNotFound_ThrowsNotFoundException()
    {
        // Arrange
        _taskRepoMock.Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>()))
                     .ReturnsAsync((TaskItem?)null);

        var act = async () => await _sut.UpdateStatusAsync(99, new UpdateTaskStatusRequest(2), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>().WithMessage("*99*");
    }

    [Fact]
    public async Task UpdateStatusAsync_WhenCurrentStatusNotFound_ThrowsNotFoundException()
    {
        // Arrange — task exists but its StatusId has no matching record
        var user = User.Create("Alice", "alice@example.com");
        var task = EntityBuilder.BuildTask(1, "T", 1, user, 1, EntityBuilder.BuildStatus(1, "Pending", 1));

        _taskRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(task);
        _statusRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                       .ReturnsAsync((TaskStatusItem?)null);

        var act = async () => await _sut.UpdateStatusAsync(1, new UpdateTaskStatusRequest(2), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task UpdateStatusAsync_WhenNewStatusNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var user    = User.Create("Alice", "alice@example.com");
        var pending = EntityBuilder.BuildStatus(1, "Pending", 1);
        var task    = EntityBuilder.BuildTask(1, "T", 1, user, 1, pending);

        _taskRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(task);
        _statusRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(pending);
        _statusRepoMock.Setup(r => r.GetByIdAsync(99, It.IsAny<CancellationToken>()))
                       .ReturnsAsync((TaskStatusItem?)null);

        var act = async () => await _sut.UpdateStatusAsync(1, new UpdateTaskStatusRequest(99), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task UpdateStatusAsync_WhenSkippingStatus_ThrowsInvalidStatusTransitionException()
    {
        // Arrange — Pending (sortOrder 1) → Done (sortOrder 3): skipping InProgress
        var user    = User.Create("Alice", "alice@example.com");
        var pending = EntityBuilder.BuildStatus(1, "Pending", 1);
        var done    = EntityBuilder.BuildStatus(3, "Done", 3);
        var task    = EntityBuilder.BuildTask(1, "T", 1, user, 1, pending);

        _taskRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(task);
        _statusRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(pending);
        _statusRepoMock.Setup(r => r.GetByIdAsync(3, It.IsAny<CancellationToken>())).ReturnsAsync(done);

        var act = async () => await _sut.UpdateStatusAsync(1, new UpdateTaskStatusRequest(3), CancellationToken.None);

        await act.Should().ThrowAsync<InvalidStatusTransitionException>();
    }

    [Fact]
    public async Task UpdateStatusAsync_WithValidTransition_UpdatesAndReturnsResponse()
    {
        // Arrange — Pending (sortOrder 1) → InProgress (sortOrder 2): valid
        var user       = User.Create("Alice", "alice@example.com");
        var pending    = EntityBuilder.BuildStatus(1, "Pending", 1);
        var inProgress = EntityBuilder.BuildStatus(2, "InProgress", 2);
        var task       = EntityBuilder.BuildTask(1, "T", 1, user, 1, pending);
        var updated    = EntityBuilder.BuildTask(1, "T", 1, user, 2, inProgress);

        _taskRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(task);
        _statusRepoMock.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(pending);
        _statusRepoMock.Setup(r => r.GetByIdAsync(2, It.IsAny<CancellationToken>())).ReturnsAsync(inProgress);
        _taskRepoMock.Setup(r => r.UpdateAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
                     .Returns(Task.CompletedTask);
        // Second GetByIdAsync call (after update) returns the updated entity
        _taskRepoMock.SetupSequence(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                     .ReturnsAsync(task)
                     .ReturnsAsync(updated);

        // Act
        var result = await _sut.UpdateStatusAsync(1, new UpdateTaskStatusRequest(2), CancellationToken.None);

        // Assert
        result.StatusId.Should().Be(2);
        result.StatusName.Should().Be("InProgress");
        _taskRepoMock.Verify(r => r.UpdateAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
