namespace backend.Application.Services
{
    public interface IBookingCleanupService
    {
        Task CleanupUnpaidBookingsAsync();
        Task HandleMissedAppointmentsAsync();
    }
}
