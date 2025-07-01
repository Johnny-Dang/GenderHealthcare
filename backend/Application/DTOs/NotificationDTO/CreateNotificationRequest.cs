namespace backend.Application.DTOs.NotificationDTO
{
    public class CreateNotificationRequest
    {
        public Guid RecipientId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }
}
