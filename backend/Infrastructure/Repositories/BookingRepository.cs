using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace backend.Infrastructure.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly IApplicationDbContext _context;

        public BookingRepository(IApplicationDbContext context)
        {
            _context = context;
        }

        // Create
        public async Task<Booking> CreateAsync(Booking booking)
        {
            booking.BookingId = Guid.NewGuid();
            booking.CreateAt = DateTime.UtcNow;
            
            _context.Booking.Add(booking);
            await _context.SaveChangesAsync();
            
            return booking;
        }

        // Delete
        public async Task<bool> DeleteAsync(Guid id)
        {
            var booking = await _context.Booking
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.BookingId == id);
                
            if (booking == null)
                return false;
                
            // Remove all booking details first (cascade delete)
            if (booking.BookingDetails != null && booking.BookingDetails.Count > 0)
            {
                _context.BookingDetail.RemoveRange(booking.BookingDetails);
            }
            
            // Remove booking
            _context.Booking.Remove(booking);
            
            await _context.SaveChangesAsync();
            
            return true;
        }

        // Additional method
        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Booking.AnyAsync(b => b.BookingId == id);
        }
    }
}
