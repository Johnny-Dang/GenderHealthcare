namespace backend.Domain.Entities
{
    public class TestResult
    {
        public Guid ResultId { get; set; }
        public Guid AppointmentId { get; set; }
        public string ResultFilePath { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = "Pending"; // Default status is Pending
        public string? Notes { get; set; }
        // Navigation properties
        public virtual Appoiment Appointment { get; set; } = default!;

    }
}
