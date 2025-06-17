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
    public class BookingDetailRepository : IBookingDetailRepository
    {
        private readonly IApplicationDbContext _context;
        
        public BookingDetailRepository(IApplicationDbContext context)
        {
            _context = context;
        }
        
        // Create
        public async Task<BookingDetail> CreateAsync(BookingDetail bookingDetail)
        {
            bookingDetail.BookingDetailId = Guid.NewGuid();
            
            _context.BookingDetail.Add(bookingDetail);
            await _context.SaveChangesAsync();
            
            return bookingDetail;
        }
        
        // Read
        public async Task<BookingDetail> GetByIdAsync(Guid id)
        {
            return await _context.BookingDetail
                .Include(bd => bd.TestService)
                .FirstOrDefaultAsync(bd => bd.BookingDetailId == id);
        }
        
        public async Task<List<BookingDetail>> GetByBookingIdAsync(Guid bookingId)
        {
            return await _context.BookingDetail
                .Include(bd => bd.TestService)
                .Where(bd => bd.BookingId == bookingId)
                .ToListAsync();
        }
        
        // Update
        public async Task<BookingDetail> UpdateAsync(BookingDetail bookingDetail)
        {
            var existingDetail = await _context.BookingDetail.FindAsync(bookingDetail.BookingDetailId);
            
            if (existingDetail == null)
                return null;
                
            existingDetail.ServiceId = bookingDetail.ServiceId;
            existingDetail.FirstName = bookingDetail.FirstName;
            existingDetail.LastName = bookingDetail.LastName;
            existingDetail.Phone = bookingDetail.Phone;
            existingDetail.DateOfBirth = bookingDetail.DateOfBirth;
            existingDetail.Gender = bookingDetail.Gender;
            
            await _context.SaveChangesAsync();
            
            return existingDetail;
        }
        
        // Delete
        public async Task<bool> DeleteAsync(Guid id)
        {
            var bookingDetail = await _context.BookingDetail.FindAsync(id);
            
            if (bookingDetail == null)
                return false;
                
            _context.BookingDetail.Remove(bookingDetail);
            await _context.SaveChangesAsync();
            
            return true;
        }
        
        // Additional methods
        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.BookingDetail.AnyAsync(bd => bd.BookingDetailId == id);
        }
        
        public async Task<bool> ExistsBookingAsync(Guid bookingId)
        {
            return await _context.Booking.AnyAsync(b => b.BookingId == bookingId);
        }
    }
}
