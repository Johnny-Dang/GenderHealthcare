using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class FeedbackConfig : IEntityTypeConfiguration<Feedback>
    {
        public void Configure(EntityTypeBuilder<Feedback> builder)
        {
            builder.HasKey(fb => fb.FeedbackId);

            builder.Property(fb => fb.ServiceId).IsRequired();
            builder.Property(fb => fb.Detail).IsRequired().HasMaxLength(1000);
            builder.Property(fb => fb.Rating).IsRequired();
            builder.Property(fb => fb.CreatedAt).IsRequired();

            builder.HasOne(fb => fb.TestService)
                .WithMany(ts => ts.Feedbacks)
                .HasForeignKey(fb => fb.ServiceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(fb => fb.Account)
                .WithMany(a => a.Feedbacks)
                .HasForeignKey(fb => fb.AccountId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
