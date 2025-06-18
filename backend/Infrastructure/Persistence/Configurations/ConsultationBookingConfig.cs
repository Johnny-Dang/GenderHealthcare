using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class ConsultationBookingConfig : IEntityTypeConfiguration<ConsultationBooking>
    {
        public void Configure(EntityTypeBuilder<ConsultationBooking> builder)
        {
            // Configure the table name
            builder.ToTable("ConsultationBooking");
            builder.HasKey(x => x.BookingId);

            builder.Property(x => x.GuestName)
                .HasMaxLength(100);

            builder.Property(x => x.GuestEmail)
                .HasMaxLength(100);

            builder.Property(x => x.GuestPhone)
                .HasMaxLength(20);

            builder.Property(x => x.Status)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("pending");

            builder.Property(x => x.Message)
                .HasColumnType("text");

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .IsRequired();

            builder.HasOne(x => x.Customer)
                .WithMany(a => a.CustomerBookings)
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Staff)
                .WithMany(a => a.StaffBookings)
                .HasForeignKey(x => x.StaffId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
