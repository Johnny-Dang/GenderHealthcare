using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class TestResult
    {
        public Guid ResultId { get; set; }
        public Guid BookingDetailId { get; set; }
        public string? Result { get; set; } = string.Empty;
        public string? Status { get; set; } = "chưa có kết quả";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public virtual BookingDetail BookingDetail { get; set;} = default!;
    }
}
