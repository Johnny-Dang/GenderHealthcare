using backend.Application.DTOs.BookingDTO;
using System;
using System.Threading.Tasks;

namespace backend.Application.Services
{
    public interface IBookingService
    {
        // Create
        Task<BookingResponse> CreateAsync(CreateBookingRequest request);
        
        // Delete
        Task<bool> DeleteAsync(Guid id);
    }
}
