using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TaskManagement.Application.Interfaces;
using TaskManagement.Infrastructure.Persistence;
using TaskManagement.Infrastructure.Repositories;

namespace TaskManagement.Infrastructure;

/// <summary>Registers all Infrastructure layer services into the DI container.</summary>
public static class DependencyInjection
{
    /// <summary>
    /// Configures EF Core with SQL Server and registers all repository implementations as scoped services.
    /// </summary>
    /// <param name="services">The application service collection.</param>
    /// <param name="configuration">Application configuration (must contain a <c>TaskManagementDB</c> connection string).</param>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register EF Core with SQL Server using the connection string from appsettings.json.
        services.AddDbContext<TaskManagementDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("TaskManagementDB")));

        // Register repositories — scoped means one instance per HTTP request.
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITaskRepository, TaskRepository>();
        services.AddScoped<ITaskStatusRepository, TaskStatusRepository>();

        return services;
    }
}