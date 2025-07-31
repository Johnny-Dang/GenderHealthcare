using backend.Application.DTOs.NotificationDTO;
using backend.Application.Interfaces;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Constants;
using backend.Domain.Entities;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace backend.Infrastructure.Services
{
    public class NotificationDomainService : INotificationDomainService
    {
        private readonly INotificationService _notificationService;
        private readonly IConsultationBookingRepository _consultationRepository;
        private readonly IBookingDetailRepository _bookingDetailRepository;
        private readonly IEmailService _emailService;
        private readonly ILogger<NotificationDomainService> _logger;

        public NotificationDomainService(
            INotificationService notificationService,
            IConsultationBookingRepository consultationRepository,
            IBookingDetailRepository bookingDetailRepository,
            IEmailService emailService,
            ILogger<NotificationDomainService> logger)
        {
            _notificationService = notificationService;
            _consultationRepository = consultationRepository;
            _bookingDetailRepository = bookingDetailRepository;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<Result<NotificationResponse>> CreateBookingNotificationAsync(Guid bookingId, Guid recipientId)
        {
            var booking = await _consultationRepository.GetBookingByIdAsync(bookingId);
            if (booking == null)
                return Result<NotificationResponse>.Failure("Booking not found");

            var request = new CreateNotificationRequest
            {
                RecipientId = recipientId,
                Title = "Lịch hẹn tư vấn mới",
                Content = $"Bạn có lịch hẹn yêu cầu tư vấn vào lúc {booking.ScheduledAt:dd/MM/yyyy HH:mm}",
                Type = "Consultation Booking"
            };

            return await _notificationService.CreateNotificationAsync(request);
        }

        public async Task NotifyTestResultReadyAsync(Guid bookingDetailId)
        {
            var bookingDetail = await _bookingDetailRepository.GetByIdAsync(bookingDetailId);
            if (bookingDetail == null) return;

            var booking = await _bookingDetailRepository.GetBookingAsync(bookingDetail.BookingId);
            if (booking == null || booking.AccountId == Guid.Empty) return;

            await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
            {
                RecipientId = booking.AccountId,
                Title = "Kết quả xét nghiệm đã sẵn sàng",
                Content = $"Kết quả xét nghiệm dịch vụ \"{bookingDetail.TestService?.ServiceName ?? ""}\" của bạn đã có.",
                Type = "TestResult"
            });
        }

        public async Task NotifyBookingDetailConfirmedAsync(Guid bookingDetailId)
        {
            var bookingDetail = await _bookingDetailRepository.GetByIdAsync(bookingDetailId);
            if (bookingDetail == null) return;

            var booking = await _bookingDetailRepository.GetBookingAsync(bookingDetail.BookingId);
            if (booking == null || booking.AccountId == Guid.Empty) return;

            await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
            {
                RecipientId = booking.AccountId,
                Title = "Lịch hẹn xét nghiệm đã được xác nhận",
                Content = $"Lịch hẹn xét nghiệm dịch vụ \"{bookingDetail.TestService?.ServiceName ?? ""}\" của bạn đã được xác nhận.",
                Type = "BookingDetailConfirmed"
            });
        }

        public async Task NotifyMissedAppointmentAsync(Guid bookingDetailId)
        {
            try
            {
                var bookingDetail = await _bookingDetailRepository.GetByIdAsync(bookingDetailId);
                if (bookingDetail == null) return;

                var booking = await _bookingDetailRepository.GetBookingAsync(bookingDetail.BookingId);
                if (booking == null || booking.AccountId == Guid.Empty || booking.Account == null) return;

                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    RecipientId = booking.AccountId,
                    Title = "Nhắc nhở lịch hẹn bị lỡ",
                    Content = $"Bạn đã không đến xét nghiệm cho dịch vụ {bookingDetail.TestService?.ServiceName} theo lịch hẹn. Vui lòng liên hệ với chúng tôi để đặt lại lịch.",
                    Type = "MissedAppointment"
                });

                // Send email notification
                await SendMissedAppointmentEmailAsync(booking.Account.Email, bookingDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error notifying missed appointment for booking detail {bookingDetailId}");
            }
        }

        private async Task SendMissedAppointmentEmailAsync(string email, BookingDetail missedDetail)
        {
            try
            {
                var serviceName = missedDetail.TestService?.ServiceName ?? "dịch vụ đã đặt";
                var appointmentDate = missedDetail.TestServiceSlot?.SlotDate.ToString("dd/MM/yyyy") ?? "ngày đã đặt";
                var shiftDisplay = missedDetail.TestServiceSlot?.Shift switch
                {
                    "AM" => "7:30 - 12:00",
                    "PM" => "13:30 - 17:00",
                    _ => missedDetail.TestServiceSlot?.Shift ?? ""
                };

                var htmlContent = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Thông báo lịch hẹn bị lỡ</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f9f9f9;'>
    <div style='max-width: 650px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);'>
        <!-- Header -->
        <div style='background-color: #2d8cf0; padding: 20px; text-align: center;'>
            <h1 style='color: white; margin: 0;'>WellCare Health Center</h1>
        </div>

        <!-- Content -->
        <div style='padding: 30px 20px;'>
            <h2 style='color: #2d8cf0; margin-top: 0;'>Thông báo lịch hẹn bị lỡ</h2>
            
            <p>Xin chào,</p>
            
            <p>Chúng tôi nhận thấy bạn đã không đến xét nghiệm theo lịch hẹn đã đặt:</p>
            
            <!-- Appointment Info Box -->
            <div style='background-color: #f8f9fa; border-left: 4px solid #ff6b6b; padding: 15px; margin: 20px 0;'>
                <div style='margin-bottom: 10px;'><strong>Dịch vụ:</strong> {serviceName}</div>
                <div style='margin-bottom: 10px;'><strong>Ngày hẹn:</strong> {appointmentDate}</div>
                <div><strong>Thời gian:</strong> {shiftDisplay}</div>
            </div>
            
            <p>Nếu bạn vẫn muốn sử dụng dịch vụ, vui lòng  liên hệ với chúng tôi qua:</p>
            
            <ul style='color: #555; padding-left: 20px;'>
                <li>Hotline: 1900 1234 567</li>
                <li>Email: info@wellcare.vn</li>
            </ul>
            
            <!-- CTA Button -->
            <div style='text-align: center; margin: 30px 0;'>
                <a href='https://gender-healthcare.vercel.app/customer/payment-history' style='background: #2d8cf0; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>Đặt lại lịch hẹn</a>
            </div>
            
            <p>Cảm ơn bạn đã quan tâm đến dịch vụ của chúng tôi.</p>
        </div>

        <!-- Footer -->
        <div style='background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #ddd;'>
            <p style='margin: 0; color: #666; font-size: 13px;'>© 2025 WellCare - Trung tâm chăm sóc sức khỏe giới tính</p>
            <p style='margin: 10px 0 0; color: #666; font-size: 12px;'>Email này được gửi tự động. Vui lòng không trả lời email này.</p>
        </div>
    </div>
</body>
</html>
";

                await _emailService.SendBookingDetailEmailAsync(
                    email,
                    "Thông báo lịch hẹn xét nghiệm bị lỡ - WellCare Health Center",
                    htmlContent
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending missed appointment email to {email}");
            }
        }
    }
}
