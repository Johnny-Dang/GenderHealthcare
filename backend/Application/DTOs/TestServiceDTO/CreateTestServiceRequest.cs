using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.ServiceDTO
{
    public class CreateTestServiceRequest
    {
        public string ServiceName { get; set; } = default!;
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; } // Optional field
        public string Category { get; set; } = default!;

    }
}
