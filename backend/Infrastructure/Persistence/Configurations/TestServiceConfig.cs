using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class TestServiceConfig : IEntityTypeConfiguration<Service>
    {
        public void Configure(EntityTypeBuilder<Service> builder)
        {
            builder.HasKey(ts => ts.ServiceId);

            builder.Property(ts => ts.ServiceName).IsRequired().HasMaxLength(255);
            builder.Property(ts => ts.Description).HasMaxLength(1000);
            builder.Property(ts => ts.Price).IsRequired();
            builder.Property(ts => ts.ImageUrl).HasMaxLength(500);
            builder.Property(ts => ts.CreatedAt).IsRequired();
            builder.Property(ts => ts.Category).IsRequired().HasMaxLength(100);

            builder.HasMany(ts => ts.BookingDetails)
                .WithOne(bd => bd.TestService)
                .HasForeignKey(bd => bd.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(ts => ts.Feedbacks)
                .WithOne(fb => fb.TestService)
                .HasForeignKey(fb => fb.ServiceId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
