using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class PaymentHistory
    {
        public Guid BookingId { get; set; }

        public Guid TransactionId { get; set; }

        public DateTime CreatedAt { get; set; }

        public decimal Amount { get; set; }

        public DateTime? ExpiredAt { get; set; }

        public virtual Booking Booking { get; set; } = default!;

    }
}
