namespace backend.Application.DTOs.ConsultationBookingDTO
{
    public class CreateConsultationBookingRequest
    {
        // Nếu là khách đã đăng nhập thì truyền CustomerId, nếu là guest thì truyền thông tin guest
        public Guid? CustomerId { get; set; }

        public string? GuestName { get; set; }
        public string? GuestEmail { get; set; }
        public string? GuestPhone { get; set; }

        public Guid StaffId { get; set; }

        public DateTime ScheduledAt { get; set; }

        public string? Message { get; set; }
    }
}
