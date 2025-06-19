using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class Payment
    {
        public Guid BookingId { get; set; }

        public Guid TransactionId { get; set; }

        public DateTime CreatedAt { get; set; }

        public decimal Amount { get; set; }

        public string PaymentMethod { get; set; } = string.Empty;

        public virtual Booking Booking { get; set; } = default!;
    }
}
