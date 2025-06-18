using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
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
            // Only generate a new BookingId if one wasn't provided
            if (booking.BookingId == Guid.Empty)
            {
                booking.BookingId = Guid.NewGuid();
            }
            
            booking.CreateAt = DateTime.UtcNow;
            
            _context.Booking.Add(booking);
            await _context.SaveChangesAsync();
            
            return booking;
        }

        // Read
        public async Task<Booking> GetByIdAsync(Guid id)
        {
            return await _context.Booking
                .Include(b => b.Account)
                .Include(b => b.PaymentHistory)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.TestService)
                .FirstOrDefaultAsync(b => b.BookingId == id);
        }

        public async Task<List<Booking>> GetAllAsync()
        {
            return await _context.Booking
                .Include(b => b.Account)
                .Include(b => b.PaymentHistory)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.TestService)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetByAccountIdAsync(Guid accountId)
        {
            return await _context.Booking
                .Include(b => b.Account)
                .Include(b => b.PaymentHistory)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.TestService)
                .Where(b => b.AccountId == accountId)
                .ToListAsync();
        }

        // Update
        public async Task<Booking> UpdateAsync(Booking booking)
        {
            var existingBooking = await _context.Booking
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.BookingId == booking.BookingId);

            if (existingBooking == null)
                return null;

            // Update booking properties
            existingBooking.UpdateAt = DateTime.UtcNow;
            
            // Handle booking details if provided
            if (booking.BookingDetails != null && booking.BookingDetails.Any())
            {
                // Remove booking details that are not in the updated list
                var detailsToRemove = existingBooking.BookingDetails
                    .Where(bd => !booking.BookingDetails.Any(newBd => newBd.BookingDetailId == bd.BookingDetailId))
                    .ToList();

                foreach (var detail in detailsToRemove)
                {
                    _context.BookingDetail.Remove(detail);
                }

                // Update existing details and add new ones
                foreach (var newDetail in booking.BookingDetails)
                {
                    var existingDetail = existingBooking.BookingDetails
                        .FirstOrDefault(bd => bd.BookingDetailId == newDetail.BookingDetailId);

                    if (existingDetail != null)
                    {
                        // Update existing detail
                        existingDetail.ServiceId = newDetail.ServiceId;
                    }
                    else
                    {
                        // Add new detail
                        newDetail.BookingId = existingBooking.BookingId;
                        _context.BookingDetail.Add(newDetail);
                    }
                }
            }

            await _context.SaveChangesAsync();
            
            return existingBooking;
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
