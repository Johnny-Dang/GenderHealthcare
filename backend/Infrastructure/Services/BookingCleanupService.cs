using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Constants;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace backend.Infrastructure.Services
{
    public class BookingCleanupService : IBookingCleanupService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IBookingDetailRepository _bookingDetailRepository;
        private readonly ITestServiceSlotService _testServiceSlotService;
        private readonly ILogger<BookingCleanupService> _logger;

        public BookingCleanupService(
            IBookingRepository bookingRepository,
            IBookingDetailRepository bookingDetailRepository,
            ITestServiceSlotService testServiceSlotService,
            ILogger<BookingCleanupService> logger)
        {
            _bookingRepository = bookingRepository;
            _bookingDetailRepository = bookingDetailRepository;
            _testServiceSlotService = testServiceSlotService;
            _logger = logger;
        }

        public async Task CleanupUnpaidBookingsAsync()
        {
            try
            {
                // Thời gian hết hạn (ví dụ: 30 phút)
                var expiryTime = DateTime.UtcNow.AddMinutes(-30);

                var unpaidBookings = await _bookingRepository.GetUnpaidBookingsBeforeTimeAsync(expiryTime);
                
                _logger.LogInformation($"Tìm thấy {unpaidBookings.Count} booking chưa thanh toán quá 30 phút");

                foreach (var booking in unpaidBookings)
                {
                    var bookingDetails = await _bookingDetailRepository.GetByBookingIdAsync(booking.BookingId);
                    
                    foreach (var detail in bookingDetails)
                    {
                        await _testServiceSlotService.DecrementSlotQuantityAsync(detail.SlotId);
                    }
                    
                    booking.Status = BookingStatus.Expired;
                    booking.UpdateAt = DateTime.UtcNow;
                    await _bookingRepository.UpdateAsync(booking);
                    
                    _logger.LogInformation($"Đã dọn dẹp booking {booking.BookingId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi dọn dẹp booking chưa thanh toán");
            }
        }
    }
}