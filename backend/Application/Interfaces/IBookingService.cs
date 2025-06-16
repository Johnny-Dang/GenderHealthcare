using backend.Domain.Entities;

namespace backend.Application.Interfaces
{
    public interface IBookingService
    {
        // Create
        Task<Booking> CreateBookingAsync(Booking booking);
        
        // Read
        Task<Booking?> GetBookingByIdAsync(Guid bookingId);
        Task<IEnumerable<Booking>> GetAllBookingsAsync();
        Task<IEnumerable<Booking>> GetBookingsByUserIdAsync(Guid userId);
        Task<IEnumerable<Booking>> GetBookingsByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        // Update
        Task<Booking?> UpdateBookingAsync(Guid bookingId, Booking booking);
        Task<bool> UpdateBookingStatusAsync(Guid bookingId, string status);
        
        // Delete
        Task<bool> DeleteBookingAsync(Guid bookingId);
        Task<bool> SoftDeleteBookingAsync(Guid bookingId);

        // Additional functionalities
        Task<bool> IsBookingExistAsync(Guid bookingId);
        Task<bool> HasActiveBookingsAsync(Guid userId);
        Task<int> GetTotalBookingsCountAsync();
        Task<decimal> GetTotalBookingsAmountAsync(Guid userId);
    }
}
