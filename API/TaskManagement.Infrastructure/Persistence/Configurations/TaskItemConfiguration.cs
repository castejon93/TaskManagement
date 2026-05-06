using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Infrastructure.Persistence.Configurations;

public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.ToTable("Tasks", "dbo");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Title)
               .IsRequired()
               .HasMaxLength(200)
               .HasColumnType("nvarchar(200)");

        builder.Property(t => t.Description)
               .HasColumnType("nvarchar(max)");

        // AdditionalInfo is a JSON column — stored as nvarchar(max).
        // Validation is done at the application layer (FluentValidation) and
        // at the DB layer (ISJSON check constraint already in the schema).
        builder.Property(t => t.AdditionalInfo)
               .HasColumnType("nvarchar(max)");

        builder.Property(t => t.CreatedAt)
               .IsRequired()
               .HasColumnType("datetime2")
               .ValueGeneratedOnAdd();

        builder.Property(t => t.UpdatedAt)
               .HasColumnType("datetime2");

        // FK: Tasks → TaskStatus
        builder.HasOne(t => t.Status)
               .WithMany(s => s.Tasks)
               .HasForeignKey(t => t.StatusId)
               .OnDelete(DeleteBehavior.Restrict)
               .HasConstraintName("FK_Tasks_TaskStatus");

        // FK: Tasks → Users
        builder.HasOne(t => t.User)
               .WithMany(u => u.Tasks)
               .HasForeignKey(t => t.UserId)
               .OnDelete(DeleteBehavior.Restrict)
               .HasConstraintName("FK_Tasks_Users");
    }
}