using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class RoleConfig : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            builder.HasKey(r => r.RoleId);
            builder.Property(r => r.Name).IsRequired().HasMaxLength(100);
            builder.Property(r => r.Description).HasMaxLength(500);
            builder.HasMany(r => r.Accounts)
                   .WithOne(a => a.Role)
                   .HasForeignKey(a => a.RoleId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
