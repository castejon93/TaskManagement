using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Infrastructure.Persistence.Configurations;

// Maps the User entity to the dbo.Users table that was created by the SQL script.
// Column names and constraints must match exactly.
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users", "dbo");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id)
               .UseIdentityColumn();          // IDENTITY(1,1)

        builder.Property(u => u.Name)
               .IsRequired()
               .HasMaxLength(100)
               .HasColumnType("nvarchar(100)");

        builder.Property(u => u.Email)
               .IsRequired()
               .HasMaxLength(150)
               .HasColumnType("nvarchar(150)");

        builder.HasIndex(u => u.Email)
               .IsUnique()
               .HasDatabaseName("UQ_Users_Email");

        builder.Property(u => u.CreatedAt)
               .IsRequired()
               .HasColumnType("datetime2")
               .HasDefaultValueSql("GETUTCDATE()");

        // Tell EF not to generate a value on add — CreatedAt is set in the entity.
        builder.Property(u => u.CreatedAt)
               .ValueGeneratedOnAdd();
    }
}