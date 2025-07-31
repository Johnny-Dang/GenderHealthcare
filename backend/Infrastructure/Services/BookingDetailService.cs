using backend.Application.DTOs.BookingDetailDTO;
using backend.Application.DTOs.NotificationDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Constants;
using backend.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Text;
using backend.Application.Interfaces;
using AutoMapper;

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
        private readonly IEmailService _emailService;
        private readonly IMapper _mapper;
        public BookingDetailService(
            IBookingDetailRepository bookingDetailRepository,
            ITestServiceRepository testServiceRepository,
            ITestServiceSlotService testServiceSlotService,
            INotificationService notificationService,
            ICloudinaryService cloudinaryService,
            INotificationDomainService notificationDomainService,
            IEmailService emailService,
            IMapper mapper)
        {
            _bookingDetailRepository = bookingDetailRepository;
            _testServiceRepository = testServiceRepository;
            _testServiceSlotService = testServiceSlotService;
            _notificationService = notificationService;
            _cloudinaryService = cloudinaryService;
            _notificationDomainService = notificationDomainService;
            _emailService = emailService;
            _mapper = mapper;
        }

        public async Task<BookingDetailResponse> CreateAsync(CreateBookingDetailRequest request)
        {
            if (!await _bookingDetailRepository.ExistsBookingAsync(request.BookingId))
                return null;

            var service = await _testServiceRepository.GetByIdAsync(request.ServiceId);
            if (service == null)
                return null;

            var slotResult = await _testServiceSlotService.FindOrCreateSlotAsync(
                request.ServiceId,
                request.SlotDate,
                request.Shift);

            if (!slotResult.IsSuccess)
                return null;

            var hasCapacityResult = await _testServiceSlotService.HasAvailableCapacityAsync(slotResult.Data.SlotId);
            if (!hasCapacityResult.IsSuccess || !hasCapacityResult.Data)
                return null; 

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

            var createdDetail = await _bookingDetailRepository.CreateAsync(bookingDetail);

            var incrementResult = await _testServiceSlotService.IncrementSlotQuantityAsync(slotResult.Data.SlotId);
            if (!incrementResult.IsSuccess)
            {
                await _bookingDetailRepository.DeleteAsync(createdDetail.BookingDetailId);
                return null;
            }

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

            await _testServiceSlotService.DecrementSlotQuantityAsync(bookingDetail.SlotId);

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

            // Update personal information
            existingDetail.FirstName = request.FirstName;
            existingDetail.LastName = request.LastName;
            existingDetail.DateOfBirth = request.DateOfBirth;
            existingDetail.Phone = request.Phone;
            existingDetail.Gender = request.Gender;

            if (request.SlotDate.HasValue && !string.IsNullOrEmpty(request.Shift))
            {
                var slots = await _testServiceSlotService.GetSlotsByServiceIdAndDateAsync(
                    existingDetail.ServiceId,
                    request.SlotDate.Value);

                if (!slots.IsSuccess)
                    return null;

                var matchingSlot = slots.Data.FirstOrDefault(s => s.Shift == request.Shift);
                if (matchingSlot == null)
                    return null; 

                var hasCapacityResult = await _testServiceSlotService.HasAvailableCapacityAsync(matchingSlot.SlotId);
                if (!hasCapacityResult.IsSuccess || !hasCapacityResult.Data)
                    return null;

                await _testServiceSlotService.DecrementSlotQuantityAsync(existingDetail.SlotId);

                var incrementResult = await _testServiceSlotService.IncrementSlotQuantityAsync(matchingSlot.SlotId);
                if (!incrementResult.IsSuccess)
                {
                    await _testServiceSlotService.IncrementSlotQuantityAsync(existingDetail.SlotId);
                    return null;
                }

                existingDetail.SlotId = matchingSlot.SlotId;
            }

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

            var booking = await _bookingDetailRepository.GetBookingAsync(updatedDetail.BookingId);
            if (booking == null)
                return null;

            var slotResult = await _testServiceSlotService.GetSlotByIdAsync(updatedDetail.SlotId);
            if (!slotResult.IsSuccess)
                return null;

            if (booking.AccountId != Guid.Empty)
            {
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

            await _notificationDomainService.NotifyTestResultReadyAsync(bookingDetailId);

            return fileUrl;
        }

        public async Task<List<BookingDetailResponse>> GetByServiceIdAsync(Guid serviceId, string status = null)
        {
            var bookingDetails = await _bookingDetailRepository.GetByServiceIdAsync(serviceId, status);
            var response = new List<BookingDetailResponse>();
            var today = DateOnly.FromDateTime(DateTime.Today);

            foreach (var detail in bookingDetails)
            {
                var slotResult = await _testServiceSlotService.GetSlotByIdAsync(detail.SlotId);
                if (!slotResult.IsSuccess)
                    continue;

                if ((string.IsNullOrEmpty(status) || status == BookingDetailStatus.Pending)
                    && slotResult.Data.SlotDate < today)
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

            return response.OrderBy(d => d.SlotDate).ToList();
        }

        public async Task<bool> ConfirmBookingDetailAsync(Guid bookingDetailId)
        {
            var bookingDetail = await _bookingDetailRepository.GetByIdAsync(bookingDetailId);
            if (bookingDetail == null)
                return false;

            if (bookingDetail.Status.ToLower() != BookingDetailStatus.Pending.ToLower())
                return false;

            bookingDetail.Status = BookingDetailStatus.Tested;
            await _bookingDetailRepository.UpdateAsync(bookingDetail);

            await _notificationDomainService.NotifyBookingDetailConfirmedAsync(bookingDetailId);

            return true;
        }

        public async Task<List<BookingDetailResponse>> GetAllAsync(string status = null)
        {
            var bookingDetails = await _bookingDetailRepository.GetAllAsync(status);
            var response = new List<BookingDetailResponse>();
            var today = DateOnly.FromDateTime(DateTime.Today);

            foreach (var detail in bookingDetails)
            {
                var slotResult = await _testServiceSlotService.GetSlotByIdAsync(detail.SlotId);
                if (!slotResult.IsSuccess)
                    continue;

                if (status == BookingDetailStatus.Pending && slotResult.Data.SlotDate < today)
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

            return response.OrderBy(d => d.SlotDate).ToList();
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
        public async Task SendBookingDetailEmailToCustomer(Guid bookingId)
        {
            var booking = await _bookingDetailRepository.GetBookingAsync(bookingId);
            if (booking == null || booking.Account == null) return;

            var bookingDetails = await _bookingDetailRepository.GetByBookingIdAsync(bookingId);
            if (bookingDetails == null || !bookingDetails.Any()) return;

            var customer = booking.Account;
            var customerName = $"{customer.FirstName} {customer.LastName}".Trim();
            
            var totalAmount = await _bookingDetailRepository.CalculateTotalAmountByBookingIdAsync(bookingId);
            
            var bookingDetailRows = new StringBuilder();
            foreach (var detail in bookingDetails)
            {
                var slotResult = await _testServiceSlotService.GetSlotByIdAsync(detail.SlotId);
                if (!slotResult.IsSuccess)
                    continue;

                string shiftDisplay = slotResult.Data.Shift switch
                {
                    "AM" => "7:30 - 12:00",
                    "PM" => "13:30 - 17:00",
                    _ => slotResult.Data.Shift
                };

                bookingDetailRows.AppendLine($@"
                    <tr>
                        <td style='padding: 12px; border: 1px solid #ddd;'>{detail.TestService?.ServiceName}</td>
                        <td style='padding: 12px; border: 1px solid #ddd; text-align: center;'>{slotResult.Data.SlotDate:dd/MM/yyyy}</td>
                        <td style='padding: 12px; border: 1px solid #ddd; text-align: center;'>{shiftDisplay}</td>
                        <td style='padding: 12px; border: 1px solid #ddd; text-align: right;'>{detail.TestService?.Price.ToString("#,##0")} VND</td>
                    </tr>
                ");
            }

            var htmlContent = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Xác nhận lịch hẹn xét nghiệm</title>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f9f9f9;'>
    <div style='max-width: 650px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);'>
        <!-- Header -->
        <div style='background-color: #2d8cf0; padding: 20px; text-align: center;'>
            <h1 style='color: white; margin: 0;'>WellCare Health Center</h1>
        </div>

        <!-- Content -->
        <div style='padding: 30px 20px;'>
            <h2 style='color: #2d8cf0; margin-top: 0;'>Xác nhận lịch hẹn xét nghiệm</h2>
            
            <p>Xin chào <strong>{customerName}</strong>,</p>
            
            <p>Cảm ơn bạn đã thanh toán thành công. Dưới đây là thông tin chi tiết lịch hẹn xét nghiệm của bạn:</p>
            
            <!-- Customer Info Box -->
            <div style='background-color: #f8f9fa; border-left: 4px solid #2d8cf0; padding: 15px; margin: 20px 0;'>
                <div style='margin-bottom: 10px;'><strong>Mã đặt lịch:</strong> #{booking.BookingId.ToString().Substring(0, 8).ToUpper()}</div>
                <div style='margin-bottom: 10px;'><strong>Khách hàng:</strong> {customerName}</div>
                <div style='margin-bottom: 10px;'><strong>Email:</strong> {customer.Email}</div>
                <div><strong>Điện thoại:</strong> {customer.Phone}</div>
            </div>

            <!-- Services Table -->
            <h3 style='color: #2d8cf0; margin-top: 25px;'>Chi tiết dịch vụ</h3>
            <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                <thead>
                    <tr style='background-color: #f4f4f4;'>
                        <th style='padding: 12px; border: 1px solid #ddd; text-align: left;'>Dịch vụ</th>
                        <th style='padding: 12px; border: 1px solid #ddd; text-align: center;'>Ngày</th>
                        <th style='padding: 12px; border: 1px solid #ddd; text-align: center;'>Thời gian</th>
                        <th style='padding: 12px; border: 1px solid #ddd; text-align: right;'>Giá</th>
                    </tr>
                </thead>
                <tbody>
                    {bookingDetailRows}
                </tbody>
                <tfoot>
                    <tr style='background-color: #f8f9fa; font-weight: bold;'>
                        <td colspan='3' style='padding: 12px; border: 1px solid #ddd; text-align: right;'>Tổng cộng:</td>
                        <td style='padding: 12px; border: 1px solid #ddd; text-align: right;'>{totalAmount.ToString("#,##0")} VND</td>
                    </tr>
                </tfoot>
            </table>
            
            <!-- Location Info -->
            <div style='background-color: #f0f8ff; border: 1px solid #b3e0ff; border-radius: 4px; padding: 15px; margin: 20px 0;'>
                <h4 style='margin-top: 0; color: #0066cc;'>Địa điểm xét nghiệm</h4>
                <p style='margin-bottom: 5px;'><strong>Trung tâm WellCare</strong></p>
                <p style='margin-bottom: 5px;'>Tòa nhà BS16 The Oasis, Vinhomes Grand Park, Quận 9, Tp. Hồ Chí Minh</p>
                <p style='margin-bottom: 0;'>Quý khách vui lòng đến đúng giờ và mang theo CMND/CCCD.</p>
            </div>
            
            <!-- Notes -->
            <div style='margin: 20px 0;'>
                <p style='color: #555;'>Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ:</p>
                <ul style='color: #555; padding-left: 20px;'>
                    <li>Hotline: 1900 1234 567</li>
                    <li>Email: info@wellcare.vn</li>
                </ul>
            </div>
            
            <!-- CTA Button -->
            <div style='text-align: center; margin: 30px 0;'>
                <a href='https://gender-healthcare.vercel.app/customer/payment-history' style='background: #2d8cf0; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>Xem chi tiết lịch hẹn</a>
            </div>
        </div>

        <!-- Footer -->
        <div style='background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #ddd;'>
            <p style='margin: 0; color: #666; font-size: 13px;'>© 2025 WellCare - Trung tâm chăm sóc sức khỏe giới tính</p>
            <p style='margin: 10px 0 0; color: #666; font-size: 12px;'>Email này được gửi tự động. Vui lòng không trả lời email này.</p>
        </div>
    </div>
</body>
</html>
";

            await _emailService.SendBookingDetailEmailAsync(
                booking.Account.Email,
                "Xác nhận lịch hẹn xét nghiệm - WellCare Health Center",
                htmlContent
            );
        }
    }
}
