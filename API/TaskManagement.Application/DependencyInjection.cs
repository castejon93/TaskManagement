using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using TaskManagement.Application.Services;

namespace TaskManagement.Application;

/// <summary>Registers all Application layer services and validators into the DI container.</summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds application services (<see cref="UserService"/>, <see cref="TaskService"/>, <see cref="TaskStatusService"/>)
    /// and all FluentValidation validators discovered in this assembly.
    /// </summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Register all services
        services.AddScoped<UserService>();
        services.AddScoped<TaskService>();
        services.AddScoped<TaskStatusService>();

        // Auto-discover and register all validators in this assembly.
        // typeof() works with static classes; the generic overload does not.
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}