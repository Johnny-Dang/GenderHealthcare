namespace backend.Application.DTOs.ConsultationBookingDTO
{
    public class UpdateConsultationBookingStatusRequest
    {
        public int BookingId { get; set; }
        []
        public string Status { get; set; } = string.Empty; // pending/confirmed/cancelled
    }
}
