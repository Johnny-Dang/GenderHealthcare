namespace backend.Application.DTOs.ServiceDTO
{
    public class TestServiceAdminResponse
    {
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = default!;
        public string Description { get; set; } = default!;
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Category { get; set; } = default!;
        public bool IsDeleted { get; set; }
    }
} 