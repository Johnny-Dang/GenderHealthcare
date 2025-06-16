using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class BookingConfig : IEntityTypeConfiguration<Booking>
    {
        public void Configure(EntityTypeBuilder<Booking> builder)
        {
            builder.HasKey(b => b.BookingId);

            builder.Property(b => b.CreateAt).IsRequired();
            builder.Property(b => b.UpdateAt);

            builder.HasOne(b => b.Account)
                .WithMany(a => a.Bookings)
                .HasForeignKey(b => b.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(b => b.PaymentHistory)
                .WithOne(p => p.Booking)
                .HasForeignKey<PaymentHistory>(p => p.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(b => b.BookingDetails)
                .WithOne(d => d.Booking)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
