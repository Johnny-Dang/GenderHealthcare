using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class RefreshTokens
    {
        public Guid Id { get; set; }

        public string Token { get; set; } = default!;

        public Guid AccountId { get; set; }

        public DateTime ExpiryDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsRevoked { get; set; } = false;

        public virtual Account Account { get; set; } = default!;
    }
}
