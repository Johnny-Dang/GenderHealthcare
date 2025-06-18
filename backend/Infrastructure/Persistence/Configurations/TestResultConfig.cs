using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class TestResultConfig : IEntityTypeConfiguration<TestResult>
    {
        public void Configure(EntityTypeBuilder<TestResult> builder)
        {
            builder.HasKey(tr => tr.ResultId);

            builder.Property(tr => tr.BookingDetailId).IsRequired();
            builder.Property(tr => tr.Result).HasMaxLength(500);
            builder.Property(tr => tr.CreatedAt).IsRequired();
            builder.Property(tr => tr.Status);

            builder.HasOne(tr => tr.BookingDetail)
                .WithOne(bd => bd.TestResult)
                .HasForeignKey<TestResult>(tr => tr.BookingDetailId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
