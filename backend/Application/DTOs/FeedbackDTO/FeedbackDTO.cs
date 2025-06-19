namespace backend.Application.DTOs.FeedbackDTO
{
    public class FeedbackDTO
    {
        public Guid FeedbackId { get; set; }
        public Guid ServiceId { get; set; }
        public Guid AccountId { get; set; }
        public string Detail { get; set; } = string.Empty;
        public int Rating { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
    }
} 