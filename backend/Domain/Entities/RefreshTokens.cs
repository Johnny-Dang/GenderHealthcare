using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class RefreshTokens
    {
        public Guid Id { get; set; }

        public string Token { get; set; }

        public DateTime ExpiryDate { get; set; }

        public Guid AccountId { get; set; }

        public virtual Account Account { get; set; }
    }
}
