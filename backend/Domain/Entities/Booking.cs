using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class Booking
    {
        public Guid BookingId { get; set; }

        public Guid UserId { get; set; }

        public DateTime CreateAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdateAt { get; set; }

        public virtual Account User { get; set; } = default!;

        public virtual PaymentHistory PaymentHistory { get; set; } = default!;

        public virtual ICollection<BookingDetail> BookingDetails {get ;set; } = new List<BookingDetail>();
    }
}
