namespace backend.Application.DTOs.ServiceDTO
{
    public class UpdateTestServiceRequest
    {
        public Guid Id { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public string Duration { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
    }
}
