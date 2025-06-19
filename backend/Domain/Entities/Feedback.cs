using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class Feedback
    {
        public Guid FeedbackId { get; set; }

        public Guid ServiceId { get; set; } 

        public Guid AccountId { get; set; }

        public string Detail { get; set; }

        public int Rating { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual TestService TestService { get; set; } = default!;

        public virtual Account Account { get; set; } = default!;
    }
}
