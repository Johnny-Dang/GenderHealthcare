using backend.Application.DTOs.NotificationDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Entities;

namespace backend.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        // muốn thông báo cho gì thì thêm vô
        private readonly INotificationRepository _notificationRepository;
        private readonly IConsultationBookingRepository _consultationRepository;
        private readonly ITestResultRepository _testResultRepository;

        public NotificationService(
            INotificationRepository notificationRepository,
            IConsultationBookingRepository consultationRepository,
            ITestResultRepository testResultRepository)
        {
            _notificationRepository = notificationRepository;
            _consultationRepository = consultationRepository;
            _testResultRepository = testResultRepository;
        }

        public async Task<Result<List<NotificationResponse>>> GetNotificationsForUserAsync(Guid userId)
        {
            var notifications = await _notificationRepository.GetNotificationsByUserIdAsync(userId);

            var response = notifications.Select(n => new NotificationResponse
            {
                NotificationId = n.NotificationId,
                Title = n.Title,
                Content = n.Content,
                IsRead = n.IsRead,
                Type = n.Type,
                CreatedAt = n.CreatedAt
            }).ToList();

            return Result<List<NotificationResponse>>.Success(response);
        }

        public async Task<Result<List<NotificationResponse>>> GetUnreadNotificationsForUserAsync(Guid userId)
        {
            var notifications = await _notificationRepository.GetUnreadNotificationsByUserIdAsync(userId);

            var response = notifications.Select(n => new NotificationResponse
            {
                NotificationId = n.NotificationId,
                Title = n.Title,
                Content = n.Content,
                IsRead = n.IsRead,
                Type = n.Type,
                CreatedAt = n.CreatedAt
            }).ToList();

            return Result<List<NotificationResponse>>.Success(response);
        }

        public async Task<Result<NotificationResponse>> CreateNotificationAsync(CreateNotificationRequest request)
        {
            var notification = new Notification
            {
                NotificationId = Guid.NewGuid(),
                RecipientId = request.RecipientId,
                Title = request.Title,
                Content = request.Content,
                Type = request.Type,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _notificationRepository.CreateNotificationAsync(notification);

            var response = new NotificationResponse
            {
                NotificationId = created.NotificationId,
                Title = created.Title,
                Content = created.Content,
                IsRead = created.IsRead,
                Type = created.Type,
                CreatedAt = created.CreatedAt
            };

            return Result<NotificationResponse>.Success(response);
        }

        public async Task<Result<bool>> MarkNotificationAsReadAsync(Guid notificationId)
        {
            var result = await _notificationRepository.UpdateNotificationReadStatusAsync(notificationId, true);
            if (!result)
                return Result<bool>.Failure("Notification not found");

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> MarkAllNotificationsAsReadAsync(Guid userId)
        {
            var result = await _notificationRepository.MarkAllNotificationsAsReadAsync(userId);
            return Result<bool>.Success(result);
        }

        public async Task<Result<int>> GetUnreadNotificationCountAsync(Guid userId)
        {
            var count = await _notificationRepository.GetUnreadNotificationCountAsync(userId);
            return Result<int>.Success(count);
        }

        public async Task<Result<bool>> DeleteNotificationAsync(Guid notificationId)
        {
            var result = await _notificationRepository.DeleteNotificationAsync(notificationId);
            if (!result)
                return Result<bool>.Failure("Notification not found");

            return Result<bool>.Success(true);
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
                Content = $"Bạn có lịch hẹn yêu cầu tư vấn vào lúc {booking.ScheduledAt.ToString("dd/MM/yyyy HH:mm")}",
                Type = "Consultation Booking"
            };

            return await CreateNotificationAsync(request);
        }

        public async Task<Result<NotificationResponse>> CreateTestResultNotificationAsync(Guid testResultId, Guid recipientId)
        {
            var testResult = await _testResultRepository.GetTestResultByIdAsync(testResultId);
            if (testResult == null)
                return Result<NotificationResponse>.Failure("Test result not found");

            var request = new CreateNotificationRequest
            {
                RecipientId = recipientId,
                Title = "Kết quả xét nghiệm đã sẵn sàng",
                Content = "Kết quả xét nghiệm của bạn đã sẵn sàng để xem",
                Type = "TestResult",
            };

            return await CreateNotificationAsync(request);
        }
    }
}
