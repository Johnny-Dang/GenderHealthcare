using backend.Application.DTOs.BookingDetailDTO;
using backend.Application.DTOs.NotificationDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Constants;
using backend.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Infrastructure.Services
{
    public class BookingDetailService : IBookingDetailService
    {
        private readonly IBookingDetailRepository _bookingDetailRepository;
        private readonly ITestServiceRepository _testServiceRepository;
        private readonly ITestServiceSlotService _testServiceSlotService;
        private readonly INotificationService _notificationService;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly INotificationDomainService _notificationDomainService;

        public BookingDetailService(
            IBookingDetailRepository bookingDetailRepository,
            ITestServiceRepository testServiceRepository,
            ITestServiceSlotService testServiceSlotService,
            INotificationService notificationService,
            ICloudinaryService cloudinaryService,
            INotificationDomainService notificationDomainService)
        {
            _bookingDetailRepository = bookingDetailRepository;
            _testServiceRepository = testServiceRepository;
            _testServiceSlotService = testServiceSlotService;
            _notificationService = notificationService;
            _cloudinaryService = cloudinaryService;
            _notificationDomainService = notificationDomainService;
        }

        public async Task<BookingDetailResponse> CreateAsync(CreateBookingDetailRequest request)
        {
            // Check if booking exists
            if (!await _bookingDetailRepository.ExistsBookingAsync(request.BookingId))
                return null;

            // Check if service exists
            var service = await _testServiceRepository.GetByIdAsync(request.ServiceId);
            if (service == null)
                return null;

            // Find or create slot
            var slotResult = await _testServiceSlotService.FindOrCreateSlotAsync(
                request.ServiceId,
                request.SlotDate,
                request.Shift);

            if (!slotResult.IsSuccess)
                return null;

            // Check if slot has available capacity
            var hasCapacityResult = await _testServiceSlotService.HasAvailableCapacityAsync(slotResult.Data.SlotId);
            if (!hasCapacityResult.IsSuccess || !hasCapacityResult.Data)
                return null; // Slot is full

            // Create booking detail entity
            var bookingDetail = new BookingDetail
            {
                BookingDetailId = Guid.NewGuid(),
                BookingId = request.BookingId,
                ServiceId = request.ServiceId,
                SlotId = slotResult.Data.SlotId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                DateOfBirth = request.DateOfBirth,
                Phone = request.Phone,
                Gender = request.Gender
            };

            // Save to database
            var createdDetail = await _bookingDetailRepository.CreateAsync(bookingDetail);

            // Increment slot's current quantity
            var incrementResult = await _testServiceSlotService.IncrementSlotQuantityAsync(slotResult.Data.SlotId);
            if (!incrementResult.IsSuccess)
            {
                // Rollback if can't increment
                await _bookingDetailRepository.DeleteAsync(createdDetail.BookingDetailId);
                return null;
            }

            // Map to response
            return new BookingDetailResponse
            {
                BookingDetailId = createdDetail.BookingDetailId,
                BookingId = createdDetail.BookingId,
                ServiceId = createdDetail.ServiceId,
                ServiceName = service.ServiceName,
                SlotId = slotResult.Data.SlotId,
                SlotDate = slotResult.Data.SlotDate,
                SlotShift = slotResult.Data.Shift,
                Price = service.Price,
                FirstName = createdDetail.FirstName,
                LastName = createdDetail.LastName,
                Phone = createdDetail.Phone,
                DateOfBirth = createdDetail.DateOfBirth,
                Gender = createdDetail.Gender,
                Status = createdDetail.Status
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var bookingDetail = await _bookingDetailRepository.GetByIdAsync(id);
            if (bookingDetail == null)
                return false;

            // Decrement the slot's current quantity
            await _testServiceSlotService.DecrementSlotQuantityAsync(bookingDetail.SlotId);

            // Delete the booking detail
            return await _bookingDetailRepository.DeleteAsync(id);
        }

        public async Task<List<BookingDetailResponse>> GetByBookingIdAsync(Guid bookingId)
        {
            var bookingDetails = await _bookingDetailRepository.GetByBookingIdAsync(bookingId);
            var response = new List<BookingDetailResponse>();

            foreach (var detail in bookingDetails)
            {
                var slotResult = await _testServiceSlotService.GetSlotByIdAsync(detail.SlotId);
                if (!slotResult.IsSuccess)
                    continue;

                response.Add(new BookingDetailResponse
                {
                    BookingDetailId = detail.BookingDetailId,
                    BookingId = detail.BookingId,
                    ServiceId = detail.ServiceId,
                    ServiceName = detail.TestService?.ServiceName ?? string.Empty,
                    SlotId = detail.SlotId,
                    SlotDate = slotResult.Data.SlotDate,
                    SlotShift = slotResult.Data.Shift,
                    Price = detail.TestService?.Price ?? 0,
                    Status = detail.Status,
                    FirstName = detail.FirstName,
                    LastName = detail.LastName,
                    Phone = detail.Phone,
                    DateOfBirth = detail.DateOfBirth,
                    Gender = detail.Gender
                });
            }

            return response;
        }

        public async Task<BookingDetailResponse> GetByIdAsync(Guid id)
        {
            var bookingDetail = await _bookingDetailRepository.GetByIdAsync(id);

            if (bookingDetail == null)
                return null;

            var slotResult = await _testServiceSlotService.GetSlotByIdAsync(bookingDetail.SlotId);
            if (!slotResult.IsSuccess)
                return null;

            return new BookingDetailResponse
            {
                BookingDetailId = bookingDetail.BookingDetailId,
                BookingId = bookingDetail.BookingId,
                ServiceId = bookingDetail.ServiceId,
                ServiceName = bookingDetail.TestService?.ServiceName ?? string.Empty,
                SlotId = bookingDetail.SlotId,
                SlotDate = slotResult.Data.SlotDate,
                SlotShift = slotResult.Data.Shift,
                Price = bookingDetail.TestService?.Price ?? 0,
                Status = bookingDetail.Status,
                FirstName = bookingDetail.FirstName,
                LastName = bookingDetail.LastName,
                Phone = bookingDetail.Phone,
                DateOfBirth = bookingDetail.DateOfBirth,
                Gender = bookingDetail.Gender,
                ResultFileUrl = bookingDetail.TestResult?.Result
            };
        }

        public async Task<BookingTotalAmountResponse> CalculateTotalAmountByBookingIdAsync(Guid bookingId)
        {
            if (!await _bookingDetailRepository.ExistsBookingAsync(bookingId))
                return null;

            var bookingDetails = await _bookingDetailRepository.GetByBookingIdAsync(bookingId);
            decimal totalAmount = await _bookingDetailRepository.CalculateTotalAmountByBookingIdAsync(bookingId);

            return new BookingTotalAmountResponse
            {
                BookingId = bookingId,
                TotalAmount = totalAmount,
                ServiceCount = bookingDetails.Count
            };
        }

        public async Task<BookingDetailResponse> UpdateInfoOnlyAsync(Guid bookingDetailId, UpdateBookingDetailRequest request)
        {
            var existingDetail = await _bookingDetailRepository.GetByIdAsync(bookingDetailId);
            if (existingDetail == null)
                return null;

            // Update personal information only
            existingDetail.FirstName = request.FirstName;
            existingDetail.LastName = request.LastName;
            existingDetail.DateOfBirth = request.DateOfBirth;
            existingDetail.Phone = request.Phone;
            existingDetail.Gender = request.Gender;

            var updatedDetail = await _bookingDetailRepository.UpdateAsync(existingDetail);

            var slotResult = await _testServiceSlotService.GetSlotByIdAsync(updatedDetail.SlotId);
            if (!slotResult.IsSuccess)
                return null;

            return new BookingDetailResponse
            {
                BookingDetailId = updatedDetail.BookingDetailId,
                BookingId = updatedDetail.BookingId,
                ServiceId = updatedDetail.ServiceId,
                ServiceName = updatedDetail.TestService?.ServiceName ?? string.Empty,
                SlotId = updatedDetail.SlotId,
                SlotDate = slotResult.Data.SlotDate,
                SlotShift = slotResult.Data.Shift,
                Price = updatedDetail.TestService?.Price ?? 0,
                Status = updatedDetail.Status,
                FirstName = updatedDetail.FirstName,
                LastName = updatedDetail.LastName,
                Phone = updatedDetail.Phone,
                DateOfBirth = updatedDetail.DateOfBirth,
                Gender = updatedDetail.Gender
            };
        }

        public async Task<BookingDetailResponse> UpdateStatusAsync(Guid bookingDetailId, string status)
        {
            var updatedDetail = await _bookingDetailRepository.UpdateStatusAsync(bookingDetailId, status);
            if (updatedDetail == null)
                return null;

            // Get booking information
            var booking = await _bookingDetailRepository.GetBookingAsync(updatedDetail.BookingId);
            if (booking == null)
                return null;

            // Get slot information
            var slotResult = await _testServiceSlotService.GetSlotByIdAsync(updatedDetail.SlotId);
            if (!slotResult.IsSuccess)
                return null;

            // Send notification to user about status update
            if (booking.AccountId != Guid.Empty)
            {
                // note cái này nên bỏ bên notification service
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    RecipientId = booking.AccountId,
                    Title = "Cập nhật trạng thái xét nghiệm",
                    Content = $"Dịch vụ xét nghiệm {updatedDetail.TestService?.ServiceName} của bạn đã được cập nhật thành '{status}'.",
                    Type = "BookingStatus"
                });
            }

            return new BookingDetailResponse
            {
                BookingDetailId = updatedDetail.BookingDetailId,
                BookingId = updatedDetail.BookingId,
                ServiceId = updatedDetail.ServiceId,
                ServiceName = updatedDetail.TestService?.ServiceName ?? string.Empty,
                SlotId = updatedDetail.SlotId,
                SlotDate = slotResult.Data.SlotDate,
                SlotShift = slotResult.Data.Shift,
                Price = updatedDetail.TestService?.Price ?? 0,
                Status = updatedDetail.Status,
                FirstName = updatedDetail.FirstName,
                LastName = updatedDetail.LastName,
                Phone = updatedDetail.Phone,
                DateOfBirth = updatedDetail.DateOfBirth,
                Gender = updatedDetail.Gender
            };
        }

        public async Task<string?> UploadTestResultAsync(Guid bookingDetailId, IFormFile file)
        {
            var bookingDetail = await _bookingDetailRepository.GetByIdAsync(bookingDetailId);
            if (bookingDetail == null)
                return null;

            // Chỉ cho upload nếu đã xác nhận
            if (bookingDetail.Status != BookingDetailStatus.Tested)
                return null;

            var fileUrl = await _cloudinaryService.UploadPdfAsync(file, "test-results");

            if (bookingDetail.TestResult == null)
            {
                bookingDetail.TestResult = new TestResult
                {
                    BookingDetailId = bookingDetailId,
                    Result = fileUrl,
                    Status = BookingDetailStatus.ResultReady
                };
            }
            else
            {
                bookingDetail.TestResult.Result = fileUrl;
                bookingDetail.TestResult.Status = BookingDetailStatus.ResultReady;
            }

            bookingDetail.Status = BookingDetailStatus.ResultReady;
            await _bookingDetailRepository.UpdateAsync(bookingDetail);

            // Gửi thông báo cho khách hàng
            await _notificationDomainService.NotifyTestResultReadyAsync(bookingDetailId);

            return fileUrl;
        }

        public async Task<List<BookingDetailResponse>> GetByServiceIdAsync(Guid serviceId, string status = null)
        {
            var bookingDetails = await _bookingDetailRepository.GetByServiceIdAsync(serviceId, status);
            var response = new List<BookingDetailResponse>();

            foreach (var detail in bookingDetails)
            {
                var slotResult = await _testServiceSlotService.GetSlotByIdAsync(detail.SlotId);
                if (!slotResult.IsSuccess)
                    continue;

                response.Add(new BookingDetailResponse
                {
                    BookingDetailId = detail.BookingDetailId,
                    BookingId = detail.BookingId,
                    ServiceId = detail.ServiceId,
                    ServiceName = detail.TestService?.ServiceName ?? string.Empty,
                    SlotId = detail.SlotId,
                    SlotDate = slotResult.Data.SlotDate,
                    SlotShift = slotResult.Data.Shift,
                    Price = detail.TestService?.Price ?? 0,
                    Status = detail.Status,
                    FirstName = detail.FirstName,
                    LastName = detail.LastName,
                    Phone = detail.Phone,
                    DateOfBirth = detail.DateOfBirth,
                    Gender = detail.Gender,
                    ResultFileUrl = detail.TestResult?.Result
                });
            }

            return response;
        }

        public async Task<bool> ConfirmBookingDetailAsync(Guid bookingDetailId)
        {
            var bookingDetail = await _bookingDetailRepository.GetByIdAsync(bookingDetailId);
            if (bookingDetail == null)
                return false;

            // Chỉ xác nhận nếu trạng thái là "Chờ xét nghiệm"
            if (bookingDetail.Status.ToLower() != BookingDetailStatus.Pending.ToLower())
                return false;

            bookingDetail.Status = BookingDetailStatus.Tested;
            await _bookingDetailRepository.UpdateAsync(bookingDetail);

            // Gửi thông báo cho khách hàng
            await _notificationDomainService.NotifyBookingDetailConfirmedAsync(bookingDetailId);

            return true;
        }

        public async Task<List<BookingDetailResponse>> GetPaidByAccountIdAsync(Guid accountId)
        {
            var details = await _bookingDetailRepository.GetPaidByAccountIdAsync(accountId);
            var result = new List<BookingDetailResponse>();
            foreach (var detail in details)
            {
                result.Add(new BookingDetailResponse
                {
                    BookingDetailId = detail.BookingDetailId,
                    BookingId = detail.BookingId,
                    ServiceId = detail.ServiceId,
                    ServiceName = detail.TestService?.ServiceName ?? string.Empty,
                    SlotId = detail.SlotId,
                    SlotDate = detail.TestServiceSlot?.SlotDate ?? default,
                    SlotShift = detail.TestServiceSlot?.Shift ?? string.Empty,
                    Status = detail.Status,
                    Price = detail.TestService?.Price ?? 0,
                    FirstName = detail.FirstName,
                    LastName = detail.LastName,
                    Phone = detail.Phone,
                    DateOfBirth = detail.DateOfBirth,
                    Gender = detail.Gender,
                    ResultFileUrl = detail.TestResult?.Result
                });
            }
            return result;
        }
    }
}
