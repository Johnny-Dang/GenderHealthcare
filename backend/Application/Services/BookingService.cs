using backend.Application.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Services
{
    public class BookingService : IBookingService
    {
        private readonly IApplicationDbContext _context;

        public BookingService(IApplicationDbContext context)
        {
            _context = context;
        }

        // Create
        public async Task<Booking> CreateBookingAsync(Booking booking)
        {
            booking.CreateAt = DateTime.UtcNow;
            await _context.Booking.AddAsync(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        // Read
        public async Task<Booking?> GetBookingByIdAsync(Guid bookingId)
        {
            return await _context.Booking
                .Include(b => b.Account)
                .Include(b => b.PaymentHistory)
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);
        }

        public async Task<IEnumerable<Booking>> GetAllBookingsAsync()
        {
            return await _context.Booking
                .Include(b => b.Account)
                .Include(b => b.PaymentHistory)
                .Include(b => b.BookingDetails)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetBookingsByUserIdAsync(Guid userId)
        {
            return await _context.Booking
                .Include(b => b.PaymentHistory)
                .Include(b => b.BookingDetails)
                .Where(b => b.AccountId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetBookingsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Booking
                .Include(b => b.Account)
                .Include(b => b.PaymentHistory)
                .Include(b => b.BookingDetails)
                .Where(b => b.CreateAt >= startDate && b.CreateAt <= endDate)
                .ToListAsync();
        }

        // Update
        public async Task<Booking?> UpdateBookingAsync(Guid bookingId, Booking booking)
        {
            var existingBooking = await _context.Booking.FindAsync(bookingId);
            if (existingBooking == null)
                return null;

            // Update properties
            existingBooking.UpdateAt = DateTime.UtcNow;
            // Add other properties to update as needed

            await _context.SaveChangesAsync();
            return existingBooking;
        }

        public async Task<bool> UpdateBookingStatusAsync(Guid bookingId, string status)
        {
            var booking = await _context.Booking.FindAsync(bookingId);
            if (booking == null)
                return false;

            booking.UpdateAt = DateTime.UtcNow;
            // Add status property if needed
            
            await _context.SaveChangesAsync();
            return true;
        }

        // Delete
        public async Task<bool> DeleteBookingAsync(Guid bookingId)
        {
            var booking = await _context.Booking.FindAsync(bookingId);
            if (booking == null)
                return false;

            _context.Booking.Remove(booking);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SoftDeleteBookingAsync(Guid bookingId)
        {
            var booking = await _context.Booking.FindAsync(bookingId);
            if (booking == null)
                return false;

            // Add IsDeleted property if needed
            booking.UpdateAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        // Additional functionalities
        public async Task<bool> IsBookingExistAsync(Guid bookingId)
        {
            return await _context.Booking.AnyAsync(b => b.BookingId == bookingId);
        }

        public async Task<bool> HasActiveBookingsAsync(Guid userId)
        {
            return await _context.Booking
                .AnyAsync(b => b.AccountId == userId);
        }

        public async Task<int> GetTotalBookingsCountAsync()
        {
            return await _context.Booking.CountAsync();
        }

        public async Task<decimal> GetTotalBookingsAmountAsync(Guid userId)
        {
            return await _context.Booking
                .Where(b => b.AccountId == userId)
                .Include(b => b.PaymentHistory)
                .SumAsync(b => b.PaymentHistory != null ? b.PaymentHistory.Amount : 0);
        }
    }
}
