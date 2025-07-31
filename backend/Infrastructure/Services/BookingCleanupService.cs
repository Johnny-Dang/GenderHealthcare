using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Constants;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Infrastructure.Services
{
    public class BookingCleanupService : IBookingCleanupService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly ITestServiceSlotService _testServiceSlotService;
        private readonly IBookingDetailRepository _bookingDetailRepository;
        private readonly INotificationDomainService _notificationDomainService;
        private readonly ILogger<BookingCleanupService> _logger;

        public BookingCleanupService(
            IBookingRepository bookingRepository,
            ITestServiceSlotService testServiceSlotService,
            IBookingDetailRepository bookingDetailRepository,
            INotificationDomainService notificationDomainService,
            ILogger<BookingCleanupService> logger)
        {
            _bookingRepository = bookingRepository;
            _testServiceSlotService = testServiceSlotService;
            _bookingDetailRepository = bookingDetailRepository;
            _notificationDomainService = notificationDomainService;
            _logger = logger;
        }

        public async Task CleanupUnpaidBookingsAsync()
        {
            try
            {
                var expiryTime = DateTime.UtcNow.AddMinutes(-30);
                
                var unpaidBookings = await _bookingRepository.GetUnpaidBookingsBeforeTimeAsync(expiryTime);

                foreach (var booking in unpaidBookings)
                {
                    var bookingDetails = await _bookingDetailRepository.GetByBookingIdAsync(booking.BookingId);
                    
                    foreach (var detail in bookingDetails)
                    {
                        await _testServiceSlotService.DecrementSlotQuantityAsync(detail.SlotId);
                    }
                    
                    await _bookingRepository.DeleteAsync(booking.BookingId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi dọn dẹp booking chưa thanh toán");
            }
        }

        public async Task HandleMissedAppointmentsAsync()
        {
            try
            {
                var today = DateOnly.FromDateTime(DateTime.Today);
                var yesterday = today.AddDays(-1);
                
                var pendingBookingDetails = await _bookingDetailRepository.GetAllAsync(BookingDetailStatus.Pending);
                
                var missedAppointments = pendingBookingDetails.Where(detail => 
                    detail.TestServiceSlot != null && 
                    detail.TestServiceSlot.SlotDate <= yesterday).ToList();
                
                foreach (var missedDetail in missedAppointments)
                {
                    // Update status to Missed
                    missedDetail.Status = BookingDetailStatus.Missed;
                    await _bookingDetailRepository.UpdateAsync(missedDetail);
                    
                    await _notificationDomainService.NotifyMissedAppointmentAsync(missedDetail.BookingDetailId);
                }
                
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xử lý lịch hẹn bị bỏ lỡ");
            }
        }
    }
}