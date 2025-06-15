using Castle.Core.Resource;
using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class ConsultationBooking
    {
        public Guid BookingId { get; set; }

        // Nullable nếu là guest
        public Guid? CustomerId { get; set; }
        public Account? Customer { get; set; }

        // Thông tin khách mời nếu không đăng nhập
        public string? GuestName { get; set; }
        public string? GuestEmail { get; set; }
        public string? GuestPhone { get; set; }
        public Guid StaffId { get; set; }
        public Account Staff { get; set; }
        public DateTime ScheduledAt { get; set; } // mong muốn gọi lúc nào
        public string Status { get; set; } = "pending"; // pending/confirmed/cancelled
        public string? Message { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
