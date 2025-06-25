namespace backend.Application.DTOs.TestResultDTO
{
    public class CreateTestResultRequest
    {
        public Guid BookingDetailId { get; set; }
        public string? Result { get; set; }
        public string? Status { get; set; }
    }
} 