namespace backend.Domain.Entities
{
    public class TestService
    {
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = default!;
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted {  get; set; }
        public string Category { get; set; } = default!;

        public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

        public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
        public virtual ICollection<TestServiceSlot> TestServiceSlots { get; set; } = new List<TestServiceSlot>();
    }
}
