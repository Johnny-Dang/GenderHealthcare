using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Persistence.Configurations
{
    public class RefreshTokenConfig : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.HasKey(r => r.RefreshTokenId);

            builder.Property(r => r.Token)
                .IsRequired();

            builder.Property(r => r.ExpiryDate)
                .IsRequired();

            builder.Property(r => r.CreatedAt)
                .IsRequired();

            builder.HasOne(r => r.Account)
                .WithMany(a => a.RefreshTokens)
                .HasForeignKey(r => r.AccountId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

}
