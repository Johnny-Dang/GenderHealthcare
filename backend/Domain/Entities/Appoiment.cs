using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class Appoiment
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid ServiceId { get; set; }
        public DateTime BookingDate { get; set; }
        //pending/confirmed/completed/cancelled
        public string Status { get; set; } = "Pending"; // Default status is Pending
        public DateTime CreateAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Account User { get; set; } = default!;
        public virtual TestService Service { get; set; } = default!;
        public virtual TestResult TestResult { get; set; } = default!; // upload đúng 1 file kết quả xét nghiệm


    }
}
