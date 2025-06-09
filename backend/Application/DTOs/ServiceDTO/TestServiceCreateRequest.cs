using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.ServiceDTO
{
    public class TestServiceCreateRequest
    {
        public string ServiceName { get; set; } = default!;
        public string Description { get; set; } = default!;
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public string Duration { get; set; } = default!;
        public string Category { get; set; } = default!;

    }
}
