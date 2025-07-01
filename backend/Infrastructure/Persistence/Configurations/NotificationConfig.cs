using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class NotificationConfig : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.ToTable("Notification");
            builder.HasKey(x => x.NotificationId);

            builder.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Content)
                .IsRequired()
                .HasMaxLength(1000)
                .IsUnicode(true);

            builder.Property(x => x.Type)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            // Relationship with User
            builder.HasOne(x => x.Account)
                .WithMany(x => x.Notifications)
                .HasForeignKey(x => x.RecipientId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
