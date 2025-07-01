namespace backend.Application.DTOs.NotificationDTO
{
    public class NotificationResponse
    {
        public Guid NotificationId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public string Type { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
