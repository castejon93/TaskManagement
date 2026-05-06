using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Infrastructure.Persistence.Configurations;

public class TaskStatusConfiguration : IEntityTypeConfiguration<TaskStatusItem>
{
    public void Configure(EntityTypeBuilder<TaskStatusItem> builder)
    {
        builder.ToTable("TaskStatus", "dbo");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
               .IsRequired()
               .HasMaxLength(20)
               .HasColumnType("nvarchar(20)");

        builder.Property(s => s.Description)
               .HasMaxLength(100)
               .HasColumnType("nvarchar(100)");

        builder.Property(s => s.SortOrder)
               .IsRequired();

        builder.HasIndex(s => s.Name)
               .IsUnique()
               .HasDatabaseName("UQ_TaskStatus_Name");
    }
}