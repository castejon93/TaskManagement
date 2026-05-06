using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using TaskManagement.API.Controllers;
using TaskManagement.Application.DTOs.Users;
using TaskManagement.Application.Interfaces;
using TaskManagement.Application.Services;
using TaskManagement.Application.Validators;

namespace TaskManagement.Tests.Controllers;

public class UsersControllerTests
{
    private readonly Mock<IUserRepository>             _userRepoMock = new();
    private readonly Mock<UserService>                 _serviceMock;
    private readonly Mock<IValidator<CreateUserRequest>> _validatorMock = new();
    private readonly UsersController                   _sut;

    public UsersControllerTests()
    {
        _serviceMock = new Mock<UserService>(_userRepoMock.Object);

        _sut = new UsersController(
            _serviceMock.Object,
            _validatorMock.Object,
            NullLogger<UsersController>.Instance);
    }

    // ── Helper ───────────────────────────────────────────────────────────────────

    private void SetupValidatorPass()
    {
        var ok = new FluentValidation.Results.ValidationResult();
        _validatorMock.Setup(v => v.ValidateAsync(It.IsAny<CreateUserRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(ok);
        _validatorMock.Setup(v => v.ValidateAsync(It.IsAny<ValidationContext<CreateUserRequest>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(ok);
    }

    private void SetupValidatorFail(string error)
    {
        var ex = new FluentValidation.ValidationException(
            new[] { new ValidationFailure("Field", error) });
        _validatorMock.Setup(v => v.ValidateAsync(It.IsAny<CreateUserRequest>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(ex);
        _validatorMock.Setup(v => v.ValidateAsync(It.IsAny<ValidationContext<CreateUserRequest>>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(ex);
    }

    // ── GetAll ────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAll_Returns200OkWithUserList()
    {
        // Arrange
        var users = new List<UserResponse>
        {
            new(1, "Alice", "alice@example.com", DateTime.UtcNow),
            new(2, "Bob",   "bob@example.com",   DateTime.UtcNow),
        };
        _serviceMock.Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>()))
                    .ReturnsAsync(users);

        // Act
        var result = await _sut.GetAll(CancellationToken.None);

        // Assert
        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.StatusCode.Should().Be(200);
        ok.Value.Should().BeAssignableTo<IEnumerable<UserResponse>>()
            .Which.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAll_WhenNoUsers_Returns200OkWithEmptyList()
    {
        // Arrange
        _serviceMock.Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>()))
                    .ReturnsAsync([]);

        // Act
        var result = await _sut.GetAll(CancellationToken.None);

        // Assert
        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.Value.Should().BeAssignableTo<IEnumerable<UserResponse>>()
            .Which.Should().BeEmpty();
    }

    // ── Create ────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_WithValidRequest_Returns201Created()
    {
        // Arrange
        SetupValidatorPass();
        var created = new UserResponse(5, "Charlie", "charlie@example.com", DateTime.UtcNow);
        _serviceMock.Setup(s => s.CreateAsync(It.IsAny<CreateUserRequest>(), It.IsAny<CancellationToken>()))
                    .ReturnsAsync(created);

        // Act
        var result = await _sut.Create(new CreateUserRequest("Charlie", "charlie@example.com"), CancellationToken.None);

        // Assert
        var created201 = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        created201.StatusCode.Should().Be(201);
        created201.Value.Should().BeEquivalentTo(created);
    }

    [Fact]
    public async Task Create_WhenValidationFails_ThrowsValidationException()
    {
        // Use a real validator so ValidateAndThrowAsync actually throws on invalid input
        var sut = new UsersController(
            _serviceMock.Object,
            new CreateUserRequestValidator(),
            NullLogger<UsersController>.Instance);

        var act = async () => await sut.Create(new CreateUserRequest("", "not-an-email"), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<FluentValidation.ValidationException>();
    }

    [Fact]
    public async Task Create_CallsServiceWithCorrectRequest()
    {
        // Arrange
        SetupValidatorPass();
        var response = new UserResponse(1, "Alice", "alice@example.com", DateTime.UtcNow);
        _serviceMock.Setup(s => s.CreateAsync(
                It.Is<CreateUserRequest>(r => r.Name == "Alice" && r.Email == "alice@example.com"),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);

        // Act
        await _sut.Create(new CreateUserRequest("Alice", "alice@example.com"), CancellationToken.None);

        // Assert
        _serviceMock.Verify(s => s.CreateAsync(
            It.Is<CreateUserRequest>(r => r.Name == "Alice" && r.Email == "alice@example.com"),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
