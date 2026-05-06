using FluentAssertions;
using Moq;
using TaskManagement.Application.DTOs.Users;
using TaskManagement.Application.Interfaces;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Tests.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _repoMock;
    private readonly UserService _sut;    // System Under Test

    public UserServiceTests()
    {
        _repoMock = new Mock<IUserRepository>();
        _sut = new UserService(_repoMock.Object);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnMappedUserResponses()
    {
        // Arrange
        var users = new List<User>
        {
            User.Create("Alice", "alice@example.com"),
            User.Create("Bob",   "bob@example.com")
        };
        _repoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
                 .ReturnsAsync(users);

        // Act
        var result = await _sut.GetAllAsync(CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result.Select(u => u.Email).Should().Contain(["alice@example.com", "bob@example.com"]);
    }

    [Fact]
    public async Task CreateAsync_WhenEmailAlreadyExists_ShouldThrowDomainException()
    {
        // Arrange — simulate an existing user with the same email
        var existing = User.Create("Alice", "alice@example.com");
        _repoMock.Setup(r => r.GetByEmailAsync("alice@example.com", It.IsAny<CancellationToken>()))
                 .ReturnsAsync(existing);

        var request = new CreateUserRequest("Alice 2", "alice@example.com");

        // Act
        var act = async () => await _sut.CreateAsync(request, CancellationToken.None);

        // Assert — duplicate email must be rejected
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("*alice@example.com*");
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ShouldCallAddAndReturnResponse()
    {
        // Arrange
        _repoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                 .ReturnsAsync((User?)null);   // No existing user

        var newUser = User.Create("Bob", "bob@example.com");
        _repoMock.Setup(r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
                 .ReturnsAsync(newUser);

        // Act
        var result = await _sut.CreateAsync(new CreateUserRequest("Bob", "bob@example.com"), CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be("bob@example.com");
        _repoMock.Verify(r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}