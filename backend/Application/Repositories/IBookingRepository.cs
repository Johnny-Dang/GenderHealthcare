using backend.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace backend.Application.Repositories
{
    public interface IBookingRepository
    {
        // Create
        Task<Booking> CreateAsync(Booking booking);
        
        // Delete
        Task<bool> DeleteAsync(Guid id);
        
        // Additional method
        Task<bool> ExistsAsync(Guid id);
    }
}
