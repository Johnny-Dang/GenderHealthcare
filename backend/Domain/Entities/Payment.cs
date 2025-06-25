using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class Payment
    {
        public Guid BookingId { get; set; }

        public string TransactionId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public decimal Amount { get; set; }

        public string PaymentMethod { get; set; } = string.Empty;

        public virtual Booking Booking { get; set; } = default!;
    }
}
