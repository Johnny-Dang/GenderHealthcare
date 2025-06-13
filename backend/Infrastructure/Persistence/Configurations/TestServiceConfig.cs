using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class TestServiceConfig : IEntityTypeConfiguration<TestService>
    {
        public void Configure(EntityTypeBuilder<TestService> builder)
        {
            // Khóa chính
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id)
                .IsRequired()
                .HasColumnType("uniqueidentifier")
                .ValueGeneratedOnAdd();


            // Các trường required
            builder.Property(x => x.ServiceName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Description)
                .IsRequired()
                .HasMaxLength(1000);

            builder.Property(x => x.Price)
                .IsRequired();

            builder.Property(x => x.Duration)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(x => x.Category)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            // Trường optional
            builder.Property(x => x.ImageUrl)
                .HasMaxLength(500);

            builder.Property(x => x.UpdatedAt)
                .IsRequired(false);
        }
    }
}
