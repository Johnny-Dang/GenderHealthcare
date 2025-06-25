using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class StaffInfoConfig : IEntityTypeConfiguration<StaffInfo>
    {
        public void Configure(EntityTypeBuilder<StaffInfo> builder)
        {
            builder.HasKey(s => s.AccountId);
            builder.Property(s => s.Department).IsRequired().HasMaxLength(50);
            builder.Property(s => s.Degree).IsRequired().HasMaxLength(100);
            builder.Property(s => s.Biography).HasMaxLength(1000);
            builder.HasOne(s => s.Account)
                .WithOne(a => a.StaffInfo)
                .HasForeignKey<StaffInfo>(s => s.AccountId)
                .OnDelete(DeleteBehavior.Cascade);  
        }
    }
}
