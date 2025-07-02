using backend.Application.DTOs.NotificationDTO;

namespace backend.Application.Services
{
    public interface INotificationService
    {
        Task<Result<List<NotificationResponse>>> GetNotificationsForUserAsync(Guid userId);
        Task<Result<List<NotificationResponse>>> GetUnreadNotificationsForUserAsync(Guid userId);
        Task<Result<NotificationResponse>> CreateNotificationAsync(CreateNotificationRequest request);
        Task<Result<bool>> MarkNotificationAsReadAsync(Guid notificationId);
        Task<Result<bool>> MarkAllNotificationsAsReadAsync(Guid userId);
        Task<Result<int>> GetUnreadNotificationCountAsync(Guid userId);
        Task<Result<bool>> DeleteNotificationAsync(Guid notificationId);

        // Helper methods for specific notifications
        Task<Result<NotificationResponse>> CreateBookingNotificationAsync(Guid bookingId, Guid recipientId);
        Task<Result<NotificationResponse>> CreateTestResultNotificationAsync(Guid testResultId, Guid recipientId);
    }
}
