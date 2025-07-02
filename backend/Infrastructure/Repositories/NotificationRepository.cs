using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories
{
    public class NotificationRepository: INotificationRepository
    {
        private readonly IApplicationDbContext _context;
        public NotificationRepository(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<List<Notification>> GetNotificationsByUserIdAsync(Guid userId)
        {
            return await _context.Notification
                .Where(n => n.RecipientId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Notification>> GetUnreadNotificationsByUserIdAsync(Guid userId)
        {
            return await _context.Notification
                .Where(n => n.RecipientId == userId && !n.IsRead)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<Notification?> GetNotificationByIdAsync(Guid notificationId)
        {
            return await _context.Notification
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId);
        }

        public async Task<Notification> CreateNotificationAsync(Notification notification)
        {
            await _context.Notification.AddAsync(notification);
            await _context.SaveChangesAsync();
            return notification;
        }

        public async Task<bool> UpdateNotificationReadStatusAsync(Guid notificationId, bool isRead)
        {
            var notification = await _context.Notification
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId);

            if (notification == null)
                return false;

            notification.IsRead = isRead;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteNotificationAsync(Guid notificationId)
        {
            var notification = await _context.Notification
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId);

            if (notification == null)
                return false;

            _context.Notification.Remove(notification);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetUnreadNotificationCountAsync(Guid userId)
        {
            return await _context.Notification
                .CountAsync(n => n.RecipientId == userId && !n.IsRead);
        }

        public async Task<bool> MarkAllNotificationsAsReadAsync(Guid userId)
        {
            var notifications = await _context.Notification
                .Where(n => n.RecipientId == userId && !n.IsRead)
                .ToListAsync();

            if (!notifications.Any())
                return true;

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
