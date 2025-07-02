using backend.Domain.Entities;

namespace backend.Application.Repositories
{
    public interface INotificationRepository
    {
        Task<List<Notification>> GetNotificationsByUserIdAsync(Guid userId);
        Task<List<Notification>> GetUnreadNotificationsByUserIdAsync(Guid userId);
        Task<Notification?> GetNotificationByIdAsync(Guid notificationId);
        Task<Notification> CreateNotificationAsync(Notification notification);
        Task<bool> UpdateNotificationReadStatusAsync(Guid notificationId, bool isRead);
        Task<bool> DeleteNotificationAsync(Guid notificationId);
        Task<int> GetUnreadNotificationCountAsync(Guid userId);
        Task<bool> MarkAllNotificationsAsReadAsync(Guid userId);

    }
}
