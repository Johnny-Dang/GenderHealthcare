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
                .Include(bd => bd.TestResult)
                .Include(bd => bd.TestService)
                .FirstOrDefaultAsync(bd => bd.BookingDetailId == id);
        }
        
        public async Task<List<BookingDetail>> GetByBookingIdAsync(Guid bookingId)
        {
            return await _context.BookingDetail
                .Include(bd => bd.TestService)
                .Include(bd => bd.TestServiceSlot)
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
        
        // Calculate total amount for a booking
        public async Task<decimal> CalculateTotalAmountByBookingIdAsync(Guid bookingId)
        {
            // Get all booking details for the specified booking ID
            var bookingDetails = await _context.BookingDetail
                .Include(bd => bd.TestService)
                .Where(bd => bd.BookingId == bookingId)
                .ToListAsync();
                
            // Calculate the total amount by summing the prices of all services
            decimal totalAmount = 0;
            
            foreach (var detail in bookingDetails)
            {
                if (detail.TestService != null)
                {
                    totalAmount += detail.TestService.Price;
                }
            }
            
            return totalAmount;
        }

        public async Task<BookingDetail> UpdateStatusAsync(Guid bookingDetailId, string status)
        {
            var existingDetail = await _context.BookingDetail.FindAsync(bookingDetailId);
            if (existingDetail == null)
                return null;
            existingDetail.Status = status;
            await _context.SaveChangesAsync();
            return existingDetail;
        }

        // để thông báo
        public async Task<Booking> GetBookingAsync(Guid bookingId)
        {
            return await _context.Booking
                .Include(b => b.Account)
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);
        }

        public async Task UpdateStatusByBookingIdAsync(Guid bookingId, string status)
        {
            var details = await _context.BookingDetail.Where(bd => bd.BookingId == bookingId).ToListAsync();
            foreach (var detail in details)
            {
                detail.Status = status;
            }
            await _context.SaveChangesAsync();
        }

        public async Task<List<BookingDetail>> GetByServiceIdAsync(Guid serviceId, string status = null)
        {
            // Tạo truy vấn cơ bản - chỉ lấy những thông tin cần thiết
            var query = _context.BookingDetail
                .Include(bd => bd.TestService)
                .Include(bd => bd.TestResult)
                .Where(bd => bd.ServiceId == serviceId)
                .AsQueryable();

            // Lọc theo trạng thái nếu có
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(bd => bd.Status == status);
            }

            return await query.ToListAsync();
        }

        public async Task<List<BookingDetail>> GetAllAsync(string status = null)
        {
            var query = _context.BookingDetail
                .Include(bd => bd.TestService)
                .Include(bd => bd.TestResult)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(bd => bd.Status == status);
            }

            return await query.ToListAsync();
        }

        public async Task<List<BookingDetail>> GetPaidByAccountIdAsync(Guid accountId)
        {
            return await _context.BookingDetail
                .Include(bd => bd.TestService)
                .Include(bd => bd.Booking)
                .Include(bd => bd.TestServiceSlot)
                .Include(bd => bd.TestResult)
                .Where(bd => bd.Booking.AccountId == accountId && bd.Booking.Payment != null)
                .ToListAsync();
        }
    }
}
