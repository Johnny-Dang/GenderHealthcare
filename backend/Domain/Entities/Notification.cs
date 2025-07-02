
using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class Notification
    {
        public Guid NotificationId { get; set; }
        public Guid RecipientId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public string Type { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual Account? Account { get; set; }
    }
}
