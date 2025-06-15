using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class PaymentHistoryConfig : IEntityTypeConfiguration<PaymentHistory>
    {
        public void Configure(EntityTypeBuilder<PaymentHistory> builder)
        {
            builder.HasKey(p => p.BookingId);

            builder.Property(p => p.TransactionId).IsRequired();
            builder.Property(p => p.CreatedAt).IsRequired();
            builder.Property(p => p.Amount).IsRequired();

            builder.HasOne(p => p.Booking)
                .WithOne(b => b.PaymentHistory)
                .HasForeignKey<PaymentHistory>(p => p.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
