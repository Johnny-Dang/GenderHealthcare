using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class AppoimentConfig : IEntityTypeConfiguration<Appoiment>
    {
        public void Configure(EntityTypeBuilder<Appoiment> builder)
        {
            // Khóa chính
            builder.HasKey(a => a.Id);

            // Các trường bắt buộc
            builder.Property(a => a.UserId)
                .IsRequired();

            builder.Property(a => a.ServiceId)
                .IsRequired();

            builder.Property(a => a.BookingDate)
                .IsRequired();

            builder.Property(a => a.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("Pending");

            builder.Property(a => a.CreateAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Quan hệ với Account (User)
            builder.HasOne(a => a.User)
                .WithMany(u => u.UserServiceBookings)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ với TestService (Service)
            builder.HasOne(a => a.Service)
                .WithMany(s => s.Appointments)
                .HasForeignKey(a => a.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ 1-1 với TestResult
            builder.HasOne(a => a.TestResult)
                .WithOne(tr => tr.Appointment)
                .HasForeignKey<TestResult>(tr => tr.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
