using backend.Application.DTOs.BookingDetailDTO;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Application.Services
{
    public interface IBookingDetailService
    {
        // Create
        Task<BookingDetailResponse> CreateAsync(CreateBookingDetailRequest request);
        
        // Read
        Task<BookingDetailResponse> GetByIdAsync(Guid id);
        Task<List<BookingDetailResponse>> GetByBookingIdAsync(Guid bookingId);
        
        // Update
        Task<BookingDetailResponse> UpdateAsync(UpdateBookingDetailRequest request);
        
        // Delete
        Task<bool> DeleteAsync(Guid id);
    }
}
