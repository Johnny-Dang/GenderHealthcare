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
        Task<List<Booking>> GetByAccountIdAsync(Guid accountId);
        
        // Update
        Task<Booking> UpdateAsync(Booking booking);
        
        // Delete
        Task<bool> DeleteAsync(Guid id);
        
        // Additional method
        Task<bool> ExistsAsync(Guid id);
    }
}
