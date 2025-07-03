using backend.Application.DTOs.PaymentDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Entities;
using backend.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VnPayDemo.Helpers;

namespace backend.Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IConfiguration _configuration;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IBookingDetailRepository _bookingDetailRepository;
        
        public PaymentService(IConfiguration configuration, IPaymentRepository paymentRepository,
            IBookingDetailRepository bookingDetail, IBookingRepository booking)
        {
            _configuration = configuration;
            _paymentRepository = paymentRepository;
            _bookingRepository = booking;
            _bookingDetailRepository = bookingDetail;
        }

        public string CreatePaymentUrl(CreateVnPayRequest model, HttpContext context)
        {
            var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById(_configuration["TimeZoneId"]);
            var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);
            var tick = model.BookingId.ToString("N");
            var pay = new VnPayLibrary();
            var urlCallBack = _configuration["VnPay:PaymentBackReturnUrl"];

            pay.AddRequestData("vnp_Version", _configuration["Vnpay:Version"]);
            pay.AddRequestData("vnp_Command", _configuration["Vnpay:Command"]);
            pay.AddRequestData("vnp_TmnCode", _configuration["Vnpay:TmnCode"]);
            pay.AddRequestData("vnp_Amount", ((int)(model.Amount * 100)).ToString());
            pay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", _configuration["Vnpay:CurrCode"]);
            pay.AddRequestData("vnp_IpAddr", pay.GetIpAddress(context));
            pay.AddRequestData("vnp_Locale", _configuration["Vnpay:Locale"]);
            pay.AddRequestData("vnp_OrderInfo", $"{model.OrderDescription}");
            pay.AddRequestData("vnp_OrderType", model.OrderType);
            pay.AddRequestData("vnp_ReturnUrl", urlCallBack);
            pay.AddRequestData("vnp_TxnRef", tick);

            var paymentUrl =
                pay.CreateRequestUrl(_configuration["Vnpay:BaseUrl"], _configuration["Vnpay:HashSecret"]);

            return paymentUrl;
        }

        public PaymentResponse PaymentExecute(IQueryCollection collections)
        {
            var pay = new VnPayLibrary();
            var response = pay.GetFullResponseData(collections, _configuration["VnPay:HashSecret"]);

            return response;
        }

        public async Task<PaymentResponse> StorePayment(PaymentResponse response)
        {
            if (response.VnPayResponseCode == "00") // Successful transaction
            {
                var newPayment = new Payment
                {
                    BookingId = response.BookingId,
                    PaymentMethod = response.PaymentMethod,
                    Amount = Decimal.Parse(response.Amount),
                    TransactionId = response.TransactionId,
                    CreatedAt = DateTime.Now,
                };
                
                // Use repository to store payment
                await _paymentRepository.CreatePaymentAsync(newPayment);

                // Cập nhật trạng thái Booking và BookingDetail
                await _bookingRepository.UpdateStatusAsync(response.BookingId, "Đã thanh toán");
                await _bookingDetailRepository.UpdateStatusByBookingIdAsync(response.BookingId, "Đã thanh toán");
            }
            return response;
        }
        
        // Additional methods for payment operations
        public async Task<PaymentDTO> GetPaymentByBookingIdAsync(Guid bookingId)
        {
            var payment = await _paymentRepository.GetPaymentByBookingIdAsync(bookingId);
            return payment != null ? MapToDTO(payment) : null;
        }

        public async Task<PaymentDTO> GetPaymentByTransactionIdAsync(string transactionId)
        {
            var payment = await _paymentRepository.GetPaymentByTransactionIdAsync(transactionId);
            return payment != null ? MapToDTO(payment) : null;
        }

        public async Task<List<PaymentDTO>> GetAllPaymentsAsync()
        {
            var payments = await _paymentRepository.GetAllPaymentsAsync();
            return payments.Select(MapToDTO).ToList();
        }
        
        // Helper method to map Payment entity to PaymentDTO
        private PaymentDTO MapToDTO(Payment payment)
        {
            return new PaymentDTO
            {
                BookingId = payment.BookingId,
                TransactionId = payment.TransactionId,
                CreatedAt = payment.CreatedAt,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod
            };
        }
    }
}
