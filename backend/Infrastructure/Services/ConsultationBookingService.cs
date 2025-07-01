using backend.Application.DTOs.ConsultationBookingDTO;
using backend.Application.Services;
using backend.Application.Repositories;
using backend.Domain.Entities;
using DeployGenderSystem.Domain.Entity;
using backend.Application.DTOs.NotificationDTO;

namespace backend.Infrastructure.Services
{
    public class ConsultationBookingService : IConsultationBookingService
    {
        private readonly IConsultationBookingRepository _repository;
        private readonly INotificationService _notificationService;

        public ConsultationBookingService(IConsultationBookingRepository repository, INotificationService notificationService)
        {
            _repository = repository;
            _notificationService = notificationService;
        }

        public async Task<Result<ConsultationBookingResponse>> CreateBookingAsync(CreateConsultationBookingRequest request)
        {
            Account? customer = null;
            if (request.CustomerId.HasValue)
            {
                customer = await _repository.GetCustomerByIdAsync(request.CustomerId.Value);
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

            var staff = await _repository.GetStaffByIdAsync(request.StaffId);
            if (staff == null)
            {
                return Result<ConsultationBookingResponse>.Failure("Staff not found");
            }

            var booking = new ConsultationBooking
            {
                BookingId = Guid.NewGuid(),
                CustomerId = request.CustomerId,
                Customer = customer,
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

            var response = await _repository.CreateBookingAsync(request, booking);

            // thêm thông báo cho tư vấn viên
            await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
            {
                RecipientId = request.StaffId,
                Title = "Có lịch hẹn tư vấn mới",
                Content = $"Bạn có lịch hẹn tư vấn mới vào ngày {booking.ScheduledAt.ToString("dd/MM/yyyy HH:mm")}",
                Type = "Booking",
            });
            return Result<ConsultationBookingResponse>.Success(response);
        }

        public async Task<Result<bool>> DeleteBookingAsync(Guid bookingId)
        {
            var result = await _repository.DeleteBookingAsync(bookingId);
            if (!result)
            {
                return Result<bool>.Failure("Booking not found");
            }
            return Result<bool>.Success(true);
        }

        public async Task<Result<List<ConsultationBookingResponse>>> GetAllBookingsAsync()
        {
            var bookings = await _repository.GetAllBookingsAsync();
            return Result<List<ConsultationBookingResponse>>.Success(bookings);
        }

        public async Task<Result<List<ConsultationBookingResponse>>> GetBookingsByCustomerIdAsync(Guid customerId)
        {
            // Nếu customerId là Guid.Empty thì coi như không hợp lệ (guest không có id)
            if (customerId == Guid.Empty)
                return Result<List<ConsultationBookingResponse>>.Failure("Guest users do not have booking history.");

            var bookings = await _repository.GetBookingsByCustomerIdAsync(customerId);
            return Result<List<ConsultationBookingResponse>>.Success(bookings);
        }

        public async Task<Result<List<ConsultationBookingResponse>>> GetBookingsByStaffIdAsync(Guid staffId)
        {
            var bookings = await _repository.GetBookingsByStaffIdAsync(staffId);
            return Result<List<ConsultationBookingResponse>>.Success(bookings);
        }

        public async Task<Result<bool>> UpdateBookingStatusAsync(Guid bookingId, string status)
        {
            var validStatuses = new[] { "pending", "confirmed", "cancelled" };
            var booking = await _repository.GetBookingByIdAsync(bookingId);
            if (booking == null)
                return Result<bool>.Failure("Booking not found.");
            if (!validStatuses.Contains(status))
                return Result<bool>.Failure("Invalid status value.");

            var result = await _repository.UpdateBookingStatusAsync(bookingId, status);
            if (!result)
                return Result<bool>.Failure("Booking not found.");

            if (booking.CustomerId.HasValue)
            {
                string title = "Cập nhật trạng thái lịch hẹn";
                string content = $"Lịch hẹn của bạn đã được cập nhật thành {status}";

                if (status == "confirmed")
                {
                    title = "Lịch hẹn đã được xác nhận";
                    content = $"Lịch hẹn của bạn vào ngày {booking.ScheduledAt.ToString("dd/MM/yyyy HH:mm")} đã được xác nhận";
                }
                else if (status == "cancelled")
                {
                    title = "Lịch hẹn đã bị hủy";
                    content = $"Lịch hẹn của bạn vào ngày {booking.ScheduledAt.ToString("dd/MM/yyyy HH:mm")} đã bị hủy";
                }

                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    RecipientId = booking.CustomerId.Value,
                    Title = title,
                    Content = content,
                    Type = "Consultant Booking"
                });
            }
            return Result<bool>.Success(true);
        }
    }
}
