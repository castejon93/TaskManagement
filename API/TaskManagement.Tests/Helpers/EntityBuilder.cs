using System.Reflection;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Tests.Helpers;

/// <summary>
/// Builds domain entities with private navigation properties populated via reflection.
/// Only for use in unit tests.
/// </summary>
internal static class EntityBuilder
{
    /// <summary>Creates a <see cref="TaskStatusItem"/> with all properties set.</summary>
    internal static TaskStatusItem BuildStatus(int id, string name, int sortOrder)
    {
        var s = (TaskStatusItem)Activator.CreateInstance(typeof(TaskStatusItem), nonPublic: true)!;
        Set(s, nameof(TaskStatusItem.Id), id);
        Set(s, nameof(TaskStatusItem.Name), name);
        Set(s, nameof(TaskStatusItem.SortOrder), sortOrder);
        return s;
    }

    /// <summary>
    /// Creates a <see cref="TaskItem"/> via the factory method and then injects
    /// the <c>Id</c>, <c>Status</c>, and <c>User</c> navigation properties.
    /// </summary>
    internal static TaskItem BuildTask(
        int id, string title, int userId, User user,
        int statusId, TaskStatusItem status,
        string? description = null, string? additionalInfo = null)
    {
        var t = TaskItem.Create(title, description, statusId, userId, additionalInfo);
        Set(t, nameof(TaskItem.Id), id);
        Set(t, nameof(TaskItem.Status), status);
        Set(t, nameof(TaskItem.User), user);
        return t;
    }

    private static void Set(object obj, string propertyName, object? value) =>
        obj.GetType()
           .GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance)!
           .SetValue(obj, value);
}
