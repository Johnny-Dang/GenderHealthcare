using backend.Application.DTOs.ConsultationBookingDTO;

namespace backend.Application.Interfaces
{
    public interface IConsultationBookingService 
    {
        Task<Result<ConsultationBookingResponse>> CreateBookingAsync(CreateConsultationBookingRequest request);
        Task<Result<List<ConsultationBookingResponse>>> GetBookingsByCustomerIdAsync(Guid customerId);
        Task<Result<List<ConsultationBookingResponse>>> GetBookingsByStaffIdAsync(Guid staffId);
        Task<Result<List<ConsultationBookingResponse>>> GetAllBookingsAsync();
        Task<Result<bool>> UpdateBookingStatusAsync(Guid bookingId, string status);
        Task<Result<bool>> DeleteBookingAsync(Guid bookingId);
    }
}
