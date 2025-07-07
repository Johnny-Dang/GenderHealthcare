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

        public NotificationService(
            INotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
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

    }
}
