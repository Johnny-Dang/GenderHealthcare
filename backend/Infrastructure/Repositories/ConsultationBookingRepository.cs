using backend.Application.DTOs.ConsultationBookingDTO;
using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories
{
    public class ConsultationBookingRepository : IConsultationBookingRepository
    {
        private readonly IApplicationDbContext _context;

        public ConsultationBookingRepository(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ConsultationBookingResponse> CreateBookingAsync(CreateConsultationBookingRequest request, ConsultationBooking booking)
        {
            _context.ConsultationBooking.Add(booking);
            await _context.SaveChangesAsync();

            var staff = await GetStaffByIdAsync(booking.StaffId);
            var customer = booking.CustomerId.HasValue ? await GetCustomerByIdAsync(booking.CustomerId.Value) : null;

            var response = new ConsultationBookingResponse
            {
                BookingId = booking.BookingId,
                CustomerId = booking.CustomerId,
                CustomerName = customer != null ? $"{customer.FirstName} {customer.LastName}".Trim() : null,
                CustomerEmail = customer?.Email,
                CustomerPhone = customer?.Phone,
                GuestName = booking.GuestName,
                GuestEmail = booking.GuestEmail,
                GuestPhone = booking.GuestPhone,
                StaffId = booking.StaffId,
                StaffName = staff != null ? $"{staff.FirstName} {staff.LastName}".Trim() : null,
                ScheduledAt = booking.ScheduledAt,
                Status = booking.Status,
                Message = booking.Message,
                CreatedAt = booking.CreatedAt,
            };

            return response;
        }

        public async Task<bool> DeleteBookingAsync(Guid bookingId)
        {
            var booking = await GetBookingByIdAsync(bookingId);
            if (booking == null)
            {
                return false;
            }
            
            _context.ConsultationBooking.Remove(booking);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ConsultationBookingResponse>> GetAllBookingsAsync()
        {
            return await _context.ConsultationBooking
                .Select(booking => new ConsultationBookingResponse
                {
                    BookingId = booking.BookingId,
                    CustomerId = booking.CustomerId,
                    CustomerName = booking.Customer != null ? $"{booking.Customer.FirstName} {booking.Customer.LastName}".Trim() : null,
                    CustomerEmail = booking.Customer != null ? booking.Customer.Email : null,
                    CustomerPhone = booking.Customer != null ? booking.Customer.Phone : null,
                    GuestName = booking.GuestName,
                    GuestEmail = booking.GuestEmail,
                    GuestPhone = booking.GuestPhone,
                    StaffId = booking.StaffId,
                    StaffName = booking.Staff != null ? $"{booking.Staff.FirstName} {booking.Staff.LastName}".Trim() : null,
                    ScheduledAt = booking.ScheduledAt,
                    Status = booking.Status,
                    Message = booking.Message,
                    CreatedAt = booking.CreatedAt,
                })
                .ToListAsync();
        }

        public async Task<ConsultationBooking?> GetBookingByIdAsync(Guid bookingId)
        {
            return await _context.ConsultationBooking.FindAsync(bookingId);
        }

        public async Task<List<ConsultationBookingResponse>> GetBookingsByCustomerIdAsync(Guid customerId)
        {
            return await _context.ConsultationBooking
                .Where(b => b.CustomerId == customerId)
                .Include(b => b.Customer)
                .Include(b => b.Staff)
                .Select(booking => new ConsultationBookingResponse
                {
                    BookingId = booking.BookingId,
                    CustomerId = booking.CustomerId,
                    CustomerName = booking.Customer != null ? $"{booking.Customer.FirstName} {booking.Customer.LastName}".Trim() : null,
                    CustomerEmail = booking.Customer != null ? booking.Customer.Email : null,
                    CustomerPhone = booking.Customer != null ? booking.Customer.Phone : null,
                    GuestName = booking.GuestName,
                    GuestEmail = booking.GuestEmail,
                    GuestPhone = booking.GuestPhone,
                    StaffId = booking.StaffId,
                    StaffName = booking.Staff != null ? $"{booking.Staff.FirstName} {booking.Staff.LastName}".Trim() : null,
                    ScheduledAt = booking.ScheduledAt,
                    Status = booking.Status,
                    Message = booking.Message,
                })
                .ToListAsync();
        }

        public async Task<List<ConsultationBookingResponse>> GetBookingsByStaffIdAsync(Guid staffId)
        {
            return await _context.ConsultationBooking
                .Where(b => b.StaffId == staffId)
                .Select(booking => new ConsultationBookingResponse
                {
                    BookingId = booking.BookingId,
                    CustomerId = booking.CustomerId,
                    CustomerName = booking.Customer != null ? $"{booking.Customer.FirstName} {booking.Customer.LastName}".Trim() : null,
                    CustomerEmail = booking.Customer != null ? booking.Customer.Email : null,
                    CustomerPhone = booking.Customer != null ? booking.Customer.Phone : null,
                    GuestName = booking.GuestName,
                    GuestEmail = booking.GuestEmail,
                    GuestPhone = booking.GuestPhone,
                    StaffId = booking.StaffId,
                    StaffName = booking.Staff != null ? $"{booking.Staff.FirstName} {booking.Staff.LastName}".Trim() : null,
                    ScheduledAt = booking.ScheduledAt,
                    Status = booking.Status,
                    Message = booking.Message,
                })
                .ToListAsync();
        }

        public async Task<Account?> GetCustomerByIdAsync(Guid customerId)
        {
            return await _context.Account.FindAsync(customerId);
        }

        public async Task<Account?> GetStaffByIdAsync(Guid staffId)
        {
            return await _context.Account.FindAsync(staffId);
        }

        public async Task<bool> UpdateBookingStatusAsync(Guid bookingId, string status)
        {
            var booking = await GetBookingByIdAsync(bookingId);
            if (booking == null)
            {
                return false;
            }

            booking.Status = status;
            booking.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            return true;
        }
    }
} 