using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class PaymentHistory
    {
        public Guid PaymentId { get; set; }

        public Guid TransactionId { get; set; }

        public DateTime CreatedAt { get; set; }

        public decimal Amount { get; set; }

        public DateTime? ExpiredAt { get; set; }

        public Booking Appoiment { get; set; } = default!;

    }
}
