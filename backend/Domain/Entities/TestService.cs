namespace backend.Domain.Entities
{
    public class TestService
    {
        public Guid Id { get; set; }
        public string ServiceName { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public string Duration { get; set; } = default!; 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string Category { get; set; } = default!;

        // Navigation property
        public virtual ICollection<Booking> Appointments { get; set; } = new List<Booking>();
    }
}
