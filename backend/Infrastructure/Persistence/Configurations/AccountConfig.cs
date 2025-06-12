using backend.Domain.Entities;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class AccountConfig : IEntityTypeConfiguration<Account>
    {
        public void Configure(EntityTypeBuilder<Account> builder)
        {
            builder.HasKey(a => a.User_Id);

            builder.Property(a => a.Email).IsRequired().HasMaxLength(255);
            builder.Property(a => a.Password).IsRequired();
            builder.Property(a => a.FirstName).HasMaxLength(50);
            builder.Property(a => a.LastName).HasMaxLength(50);
            builder.Property(a => a.Phone).HasMaxLength(20);
            builder.Property(a => a.avatarUrl).HasMaxLength(500);

            builder.HasOne(a => a.Role)
                .WithMany(r => r.Accounts)
                .HasForeignKey(a => a.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.StaffInfo)
                .WithOne(s => s.Account)
                .HasForeignKey<StaffInfo>(s => s.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(a => a.RefreshToken)
                .WithOne(r => r.Account)
                .HasForeignKey(r => r.AccountId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
