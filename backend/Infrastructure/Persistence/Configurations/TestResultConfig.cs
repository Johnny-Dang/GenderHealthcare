using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class TestResultConfig : IEntityTypeConfiguration<TestResult>
    {
        public void Configure(EntityTypeBuilder<TestResult> builder)
        {
            // Khóa chính
            builder.HasKey(tr => tr.ResultId);

            // Các trường bắt buộc
            builder.Property(tr => tr.AppointmentId)
                .IsRequired();

            builder.Property(tr => tr.ResultFilePath)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(tr => tr.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(tr => tr.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("Pending");

            builder.Property(tr => tr.Notes)
                .HasMaxLength(1000);

            // Quan hệ 1-1 với Appoiment
            builder.HasOne(tr => tr.Appointment)
                .WithOne(a => a.TestResult)
                .HasForeignKey<TestResult>(tr => tr.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
