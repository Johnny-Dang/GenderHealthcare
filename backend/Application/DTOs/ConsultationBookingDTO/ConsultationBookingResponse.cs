namespace backend.Application.DTOs.ConsultationBookingDTO
{
    public class ConsultationBookingResponse
    {
        public Guid BookingId { get; set; }
        // Customer
        public Guid? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }
        // Guest
        public string? GuestName { get; set; }
        public string? GuestEmail { get; set; }
        public string? GuestPhone { get; set; }
        public Guid StaffId { get; set; }
        public string? StaffName { get; set; }
        public DateTime ScheduledAt { get; set; }
        public string Status { get; set; } = "pending";
        public string? Message { get; set; }
    }
}
