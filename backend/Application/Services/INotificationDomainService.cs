using backend.Application.DTOs.NotificationDTO;

namespace backend.Application.Services
{
    public interface INotificationDomainService
    {
        Task<Result<NotificationResponse>> CreateBookingNotificationAsync(Guid bookingId, Guid recipientId);
        Task NotifyTestResultReadyAsync(Guid bookingDetailId);
        Task NotifyBookingDetailConfirmedAsync(Guid bookingDetailId);
        Task NotifyMissedAppointmentAsync(Guid bookingDetailId);
    }
}
