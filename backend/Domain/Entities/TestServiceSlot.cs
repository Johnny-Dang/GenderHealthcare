namespace backend.Domain.Entities
{
    public class TestServiceSlot
    {
        public Guid SlotId { get; set; }
        public Guid ServiceId { get; set; }
        public DateOnly SlotDate { get; set; }
        public string Shift { get; set; } = default!; // "AM" hoặc "PM"
        public int MaxQuantity { get; set; } = 10;
        public int CurrentQuantity { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual TestService TestService { get; set; } = default!;
        public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();
    }
}
