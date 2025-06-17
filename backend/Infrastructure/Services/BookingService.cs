using backend.Application.DTOs.BookingDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace backend.Infrastructure.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        
        public BookingService(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }
        
        // Create a booking
        public async Task<BookingResponse> CreateAsync(CreateBookingRequest request)
        {
            // Create booking entity
            var booking = new Booking
            {
                AccountId = request.AccountId,
                CreateAt = DateTime.UtcNow
            };
            
            // Save booking to get ID
            var createdBooking = await _bookingRepository.CreateAsync(booking);
            
            // Map to response
            return MapToResponse(createdBooking);
        }
        
        // Delete a booking
        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _bookingRepository.DeleteAsync(id);
        }
        
        // Helper method for mapping
        private BookingResponse MapToResponse(Booking booking)
        {
            if (booking == null) return null;
            
            return new BookingResponse
            {
                BookingId = booking.BookingId,
                AccountId = booking.AccountId,
                CreateAt = booking.CreateAt,
                UpdateAt = booking.UpdateAt
            };
        }
    }
}
