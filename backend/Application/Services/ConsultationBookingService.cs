using backend.Application.DTOs.ConsultationBookingDTO;
using backend.Application.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Castle.Core.Resource;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Services
{
    public class ConsultationBookingService : IConsultationBookingService
    {
        private readonly IApplicationDbContext _context;
        public ConsultationBookingService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<ConsultationBookingResponse>> CreateBookingAsync(CreateConsultationBookingRequest request)
        {
            Account? customer = null;
            if (request.CustomerId.HasValue)
            {
                customer = await _context.Accounts.FindAsync(request.CustomerId.Value);
                if (customer == null)
                {
                    return Result<ConsultationBookingResponse>.Failure("Customer not found");
                }
            }
            else
            {
                if (string.IsNullOrEmpty(request.GuestName) ||
                    string.IsNullOrEmpty(request.GuestEmail) ||
                    string.IsNullOrEmpty(request.GuestPhone))
                {
                    return Result<ConsultationBookingResponse>.Failure("Guest information is incomplete");
                }
            }

            var staff = await _context.Accounts.FindAsync(request.StaffId);
            if (staff == null)
            {
                return Result<ConsultationBookingResponse>.Failure("Staff not found");
            }

            var booking = new ConsultationBooking
            {
                BookingId = Guid.NewGuid(),
                CustomerId = request.CustomerId,
                Customer =  customer,
                GuestName = request.GuestName,
                GuestEmail = request.GuestEmail,
                GuestPhone = request.GuestPhone,
                StaffId = request.StaffId,
                Staff = staff,
                ScheduledAt = request.ScheduledAt,
                Status = "pending",
                Message = request.Message,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ConsultationBookings.Add(booking);
            await _context.SaveChangesAsync();

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
                StaffName = $"{staff.FirstName} {staff.LastName}".Trim(),
                ScheduledAt = booking.ScheduledAt,
                Status = booking.Status,
                Message = booking.Message
            };

            return Result<ConsultationBookingResponse>.Success(response);
        }

        public async Task<Result<bool>> DeleteBookingAsync(Guid bookingId)
        {
            var booking = await _context.ConsultationBookings.FindAsync(bookingId);
            if (booking == null)
            {
                return Result<bool>.Failure("Booking not found");
            }
            _context.ConsultationBookings.Remove(booking);
            await _context.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        public async Task<Result<List<ConsultationBookingResponse>>> GetAllBookingsAsync()
        {
            var bookings = await _context.ConsultationBookings
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
            return Result<List<ConsultationBookingResponse>>.Success(bookings);
        }


        public async Task<Result<List<ConsultationBookingResponse>>> GetBookingsByStaffIdAsync(Guid staffId)
        {
            var bookings = await _context.ConsultationBookings
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
            return Result<List<ConsultationBookingResponse>>.Success(bookings);
        }

        public async Task<Result<bool>> UpdateBookingStatusAsync(Guid bookingId, string status)
        {
            var validStatuses = new[] { "pending", "confirmed", "cancelled" };
            if (!validStatuses.Contains(status))
                return Result<bool>.Failure("Invalid status value.");

            // Tìm booking
            var booking = await _context.ConsultationBookings.FindAsync(bookingId);
            if (booking == null)
                return Result<bool>.Failure("Booking not found.");

            // Cập nhật trạng thái
            booking.Status = status;
            booking.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }
    }
}
