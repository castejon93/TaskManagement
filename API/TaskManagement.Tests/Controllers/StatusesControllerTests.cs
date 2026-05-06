using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using TaskManagement.API.Controllers;
using TaskManagement.Application.DTOs.Statuses;
using TaskManagement.Application.Interfaces;
using TaskManagement.Application.Services;
using TaskManagement.Tests.Helpers;

namespace TaskManagement.Tests.Controllers;

public class StatusesControllerTests
{
    private readonly Mock<ITaskStatusRepository> _repoMock = new();
    private readonly Mock<TaskStatusService>     _serviceMock;
    private readonly StatusesController          _sut;

    public StatusesControllerTests()
    {
        _serviceMock = new Mock<TaskStatusService>(_repoMock.Object);

        _sut = new StatusesController(
            _serviceMock.Object,
            NullLogger<StatusesController>.Instance);
    }

    [Fact]
    public async Task GetAll_Returns200OkWithStatusList()
    {
        // Arrange
        var statuses = new List<TaskStatusResponse>
        {
            new(1, "Pending",    null, 1),
            new(2, "InProgress", null, 2),
            new(3, "Done",       null, 3),
        };
        _serviceMock.Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>()))
                    .ReturnsAsync(statuses);

        // Act
        var result = await _sut.GetAll(CancellationToken.None);

        // Assert
        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.StatusCode.Should().Be(200);
        ok.Value.Should().BeAssignableTo<IEnumerable<TaskStatusResponse>>()
            .Which.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetAll_WhenNoStatuses_Returns200OkWithEmptyList()
    {
        // Arrange
        _serviceMock.Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>()))
                    .ReturnsAsync([]);

        // Act
        var result = await _sut.GetAll(CancellationToken.None);

        // Assert
        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.Value.Should().BeAssignableTo<IEnumerable<TaskStatusResponse>>()
            .Which.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAll_StatusesAreOrderedBySortOrder()
    {
        // Arrange — returned in natural sort order from the service
        var statuses = new List<TaskStatusResponse>
        {
            new(1, "Pending",    null, 1),
            new(2, "InProgress", null, 2),
            new(3, "Done",       null, 3),
        };
        _serviceMock.Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>()))
                    .ReturnsAsync(statuses);

        // Act
        var result = await _sut.GetAll(CancellationToken.None);

        // Assert
        var body = ((OkObjectResult)result).Value
            .Should().BeAssignableTo<IEnumerable<TaskStatusResponse>>().Subject;
        body.Select(s => s.SortOrder).Should().BeInAscendingOrder();
    }
}
