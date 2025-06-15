namespace backend.Application.DTOs.ConsultationBookingDTO
{
    public class UpdateConsultationBookingStatusRequest
    {
        public Guid BookingId { get; set; }
        public string Status { get; set; } = string.Empty; // pending/confirmed/cancelled
    }
}
