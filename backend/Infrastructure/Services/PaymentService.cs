using backend.Application.DTOs.PaymentDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Entities;
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
        
        public PaymentService(IConfiguration configuration, IPaymentRepository paymentRepository)
        {
            _configuration = configuration;
            _paymentRepository = paymentRepository;
        }

        public string CreatePaymentUrl(CreateVnPayRequest model, HttpContext context)
        {
            var timeZoneById = TimeZoneInfo.FindSystemTimeZoneById(_configuration["TimeZoneId"]);
            var timeNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZoneById);
            var tick = DateTime.Now.Ticks.ToString();
            var pay = new VnPayLibrary();
            var urlCallBack = _configuration["Vnpay:ReturnUrl"];

            pay.AddRequestData("vnp_Version", _configuration["Vnpay:Version"]);
            pay.AddRequestData("vnp_Command", _configuration["Vnpay:Command"]);
            pay.AddRequestData("vnp_TmnCode", _configuration["Vnpay:TmnCode"]);
            pay.AddRequestData("vnp_Amount", ((decimal)(model.Amount * 100)).ToString());
            pay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
            pay.AddRequestData("vnp_CurrCode", _configuration["Vnpay:CurrCode"]);
            pay.AddRequestData("vnp_IpAddr", pay.GetIpAddress(context));
            pay.AddRequestData("vnp_Locale", _configuration["Vnpay:Locale"]);
            pay.AddRequestData("vnp_OrderInfo", $"{model.OrderDescription},{model.Amount}");
            pay.AddRequestData("vnp_OrderType", model.OrderType);
            pay.AddRequestData("vnp_ReturnUrl", urlCallBack);
            pay.AddRequestData("vnp_TxnRef", tick);

            var paymentUrl =
                pay.CreateRequestUrl(_configuration["Vnpay:PaymentUrl"], _configuration["Vnpay:HashSecret"]);

            return paymentUrl;
        }

        public PaymentResponse PaymentExecute(IQueryCollection collections)
        {
            var pay = new VnPayLibrary();
            var response = pay.GetFullResponseData(collections, _configuration["Vnpay:HashSecret"]);

            return response;
        }

        public async Task<PaymentResponse> StorePayment(PaymentResponse response)
        {
            if (response.VnPayResponseCode == "00") // Successful transaction
            {
                var OrderInfo = response.OrderInfo.Split(",");
                var newPayment = new Payment
                {
                    BookingId = Guid.Parse(OrderInfo[0]),
                    PaymentMethod = response.PaymentMethod,
                    Amount = Decimal.Parse(OrderInfo[1]),
                    TransactionId = Guid.Parse(response.TransactionId),
                    CreatedAt = DateTime.Now,
                };
                
                // Use repository to store payment
                await _paymentRepository.CreatePaymentAsync(newPayment);
            }
            return response;
        }
        
        // Additional methods for payment operations
        public async Task<PaymentDTO> GetPaymentByBookingIdAsync(Guid bookingId)
        {
            var payment = await _paymentRepository.GetPaymentByBookingIdAsync(bookingId);
            return payment != null ? MapToDTO(payment) : null;
        }

        public async Task<PaymentDTO> GetPaymentByTransactionIdAsync(Guid transactionId)
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
