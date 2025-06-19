using backend.Application.DTOs.ConsultationBookingDTO;
using backend.Domain.Entities;
using DeployGenderSystem.Domain.Entity;

namespace backend.Application.Repositories
{
    public interface IConsultationBookingRepository
    {
        Task<ConsultationBookingResponse> CreateBookingAsync(CreateConsultationBookingRequest request, ConsultationBooking booking);
        Task<List<ConsultationBookingResponse>> GetBookingsByCustomerIdAsync(Guid customerId);
        Task<List<ConsultationBookingResponse>> GetBookingsByStaffIdAsync(Guid staffId);
        Task<List<ConsultationBookingResponse>> GetAllBookingsAsync();
        Task<bool> UpdateBookingStatusAsync(Guid bookingId, string status);
        Task<bool> DeleteBookingAsync(Guid bookingId);
        Task<Account?> GetCustomerByIdAsync(Guid customerId);
        Task<Account?> GetStaffByIdAsync(Guid staffId);
        Task<ConsultationBooking?> GetBookingByIdAsync(Guid bookingId);
    }
} 