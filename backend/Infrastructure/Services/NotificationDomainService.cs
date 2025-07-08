using backend.Application.DTOs.NotificationDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Entities;

namespace backend.Infrastructure.Services
{
    public class NotificationDomainService: INotificationDomainService
    {
        private readonly INotificationService _notificationService;
        private readonly IConsultationBookingRepository _consultationRepository;
        private readonly IBookingDetailRepository _bookingDetailRepository;

        public NotificationDomainService(
            INotificationService notificationService,
            IConsultationBookingRepository consultationRepository,
            IBookingDetailRepository bookingDetailRepository)
        {
            _notificationService = notificationService;
            _consultationRepository = consultationRepository;
            _bookingDetailRepository = bookingDetailRepository;
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
    }
}
