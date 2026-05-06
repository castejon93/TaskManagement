using FluentAssertions;
using Moq;
using TaskManagement.Application.Interfaces;
using TaskManagement.Application.Services;
using TaskManagement.Tests.Helpers;

namespace TaskManagement.Tests.Services;

public class TaskStatusServiceTests
{
    private readonly Mock<ITaskStatusRepository> _repoMock = new();
    private readonly TaskStatusService           _sut;

    public TaskStatusServiceTests()
    {
        _sut = new TaskStatusService(_repoMock.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsMappedResponses()
    {
        // Arrange
        var statuses = new[]
        {
            EntityBuilder.BuildStatus(1, "Pending",    1),
            EntityBuilder.BuildStatus(2, "InProgress", 2),
            EntityBuilder.BuildStatus(3, "Done",       3),
        };
        _repoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
                 .ReturnsAsync(statuses);

        // Act
        var result = await _sut.GetAllAsync(CancellationToken.None);

        // Assert
        result.Should().HaveCount(3);
        result.Select(s => s.Name).Should().ContainInOrder("Pending", "InProgress", "Done");
    }

    [Fact]
    public async Task GetAllAsync_MapsAllFieldsCorrectly()
    {
        // Arrange
        var status = EntityBuilder.BuildStatus(2, "InProgress", 2);
        _repoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
                 .ReturnsAsync([status]);

        // Act
        var result = (await _sut.GetAllAsync(CancellationToken.None)).Single();

        // Assert
        result.Id.Should().Be(2);
        result.Name.Should().Be("InProgress");
        result.SortOrder.Should().Be(2);
    }

    [Fact]
    public async Task GetAllAsync_WhenRepositoryReturnsEmpty_ReturnsEmptyCollection()
    {
        // Arrange
        _repoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
                 .ReturnsAsync([]);

        // Act
        var result = await _sut.GetAllAsync(CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }
}
