using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class TestServiceSlotConfiguration : IEntityTypeConfiguration<TestServiceSlot>
    {
        public void Configure(EntityTypeBuilder<TestServiceSlot> builder)
        {
            builder.ToTable("TestServiceSlot");

            builder.HasKey(x => x.SlotId);

            builder.Property(x => x.SlotId)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.ServiceId)
                .IsRequired();

            builder.Property(x => x.SlotDate)
                .HasColumnType("date")
                .IsRequired();

            builder.Property(x => x.Shift)
                .HasColumnType("varchar(10)")
                .HasMaxLength(10)
                .IsRequired();

            builder.Property(x => x.MaxQuantity)
                .IsRequired()
                .HasDefaultValue(10);

            builder.Property(x => x.CurrentQuantity)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.Property(x => x.UpdatedAt)
                .IsRequired();

            // Relationship with TestService
            builder.HasOne(x => x.TestService)
                .WithMany(t => t.TestServiceSlots)
                .HasForeignKey(x => x.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
