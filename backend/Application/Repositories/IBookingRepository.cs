using backend.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Application.Repositories
{
    public interface IBookingRepository
    {
        // Create
        Task<Booking> CreateAsync(Booking booking);
        
        // Read
        Task<Booking> GetByIdAsync(Guid id);
        Task<List<Booking>> GetAllAsync();
        Task<Booking> GetByAccountIdAsync(Guid accountId);
        Task<IEnumerable<Booking>> GetByAccountIdWithDetailsAsync(Guid accountId);
        Task<List<Booking>> GetUnpaidBookingsBeforeTimeAsync(DateTime cutoffTime);
        
        // Update
        Task<Booking> UpdateAsync(Booking booking);
        Task<bool> UpdateStatusAsync(Guid bookingId, string status);
        
        // Delete
        Task<bool> DeleteAsync(Guid id);
        
        // Additional method
        Task<bool> ExistsAsync(Guid id);

    }
}
