namespace backend.Application.DTOs.TestResultDTO
{
    public class TestResultResponse
    {
        public Guid ResultId { get; set; }
        public Guid BookingDetailId { get; set; }
        public string? Result { get; set; }
        public bool? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        // Additional information
        public string? CustomerName { get; set; }
        public string? ServiceName { get; set; }
    }
} 