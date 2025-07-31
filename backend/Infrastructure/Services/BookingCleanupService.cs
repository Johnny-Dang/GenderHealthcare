using backend.Application.Repositories;
using backend.Application.Services;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace backend.Infrastructure.Services
{
    public class BookingCleanupService : IBookingCleanupService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly ITestServiceSlotService _testServiceSlotService;
        private readonly IBookingDetailRepository _bookingDetailRepository;
        private readonly ILogger<BookingCleanupService> _logger;

        public BookingCleanupService(
            IBookingRepository bookingRepository,
            ITestServiceSlotService testServiceSlotService,
            IBookingDetailRepository bookingDetailRepository,
            ILogger<BookingCleanupService> logger)
        {
            _bookingRepository = bookingRepository;
            _testServiceSlotService = testServiceSlotService;
            _bookingDetailRepository = bookingDetailRepository;
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
    }
}