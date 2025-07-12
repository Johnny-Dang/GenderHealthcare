using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class TestServiceConfig : IEntityTypeConfiguration<TestService>
    {
        public void Configure(EntityTypeBuilder<TestService> builder)
        {
            builder.HasKey(ts => ts.ServiceId);

            builder.Property(ts => ts.ServiceName).IsRequired().HasMaxLength(255);
            builder.Property(ts => ts.Description).HasMaxLength(1000);
            builder.Property(ts => ts.Title).IsRequired().HasMaxLength(255);
            builder.Property(ts => ts.Price).IsRequired();
            builder.Property(ts => ts.ImageUrl).HasMaxLength(500);
            builder.Property(ts => ts.CreatedAt).IsRequired();
            builder.Property(ts => ts.Category).IsRequired().HasMaxLength(100);
            builder.Property(ts => ts.IsDeleted).HasDefaultValue(false);

            // Thêm navigation property với TestServiceSlot
            builder.HasMany(ts => ts.TestServiceSlots)
                .WithOne(tss => tss.TestService)
                .HasForeignKey(tss => tss.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
