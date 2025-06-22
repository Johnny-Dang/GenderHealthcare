using backend.Application.DTOs.BookingDTO;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Application.Services
{
    public interface IBookingService
    {
        // Create
        Task<BookingResponse> CreateAsync(CreateBookingRequest request);
        
        // Read
        Task<BookingResponse> GetByIdAsync(Guid id);
        Task<List<BookingResponse>> GetAllAsync();
        Task<IEnumerable<BookingResponse>> GetByAccountIdAsync(Guid accountId);
        
        // Update
        Task<BookingResponse> UpdateAsync(UpdateBookingRequest request);
        
        // Delete
        Task<bool> DeleteAsync(Guid id);
    }
}
