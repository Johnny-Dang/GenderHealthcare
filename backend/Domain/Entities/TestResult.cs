using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class TestResult
    {
        public Guid ResultId { get; set; }
        public Guid AppointmentId { get; set; }
        public string ResultFilePath { get; set; } = string.Empty;
        public Guid StaffId { get; set; } // ID of the staff who uploaded the result
        public string? Notes { get; set; }
        public string Status { get; set; } = "Pending"; // Default status is Pending
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        // Navigation properties
        public virtual Appoiment Appointment { get; set; } = default!;
        public virtual Account Staff { get; set; } = default!; // Staff who uploaded the result
    }
}
