using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class Booking
    {
        public Guid BookingId { get; set; }

        public Guid AccountId { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime CreateAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdateAt { get; set; }

        public virtual Account Account { get; set; } = default!;

        public virtual Payment Payment { get; set; } = default!;

        public virtual ICollection<BookingDetail> BookingDetails {get ;set; } = new List<BookingDetail>();
    }
}
