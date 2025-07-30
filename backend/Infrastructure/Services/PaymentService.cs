using AutoMapper;
using backend.Application.DTOs.PaymentDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Constants;
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
        private readonly IBookingDetailService _bookingDetailService;
        private readonly IMapper _mapper;
        public PaymentService(
            IConfiguration configuration,
            IPaymentRepository paymentRepository,
            IBookingDetailRepository bookingDetail,
            IBookingRepository booking,
            IBookingDetailService bookingDetailService,
            IMapper mapper
        )
        {
            _configuration = configuration;
            _paymentRepository = paymentRepository;
            _bookingRepository = booking;
            _bookingDetailRepository = bookingDetail;
            _bookingDetailService = bookingDetailService;
            _mapper = mapper;   
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
                
                await _paymentRepository.CreatePaymentAsync(newPayment);
                await _bookingRepository.UpdateStatusAsync(response.BookingId, BookingStatus.Completed);
                await _bookingDetailRepository.UpdateStatusByBookingIdAsync(response.BookingId, BookingDetailStatus.Pending);

                await _bookingDetailService.SendBookingDetailEmailToCustomer(response.BookingId);
            }
            return response;
        }
        
        public async Task<PaymentDTO> GetPaymentByBookingIdAsync(Guid bookingId)
        {
            var payment = await _paymentRepository.GetPaymentByBookingIdAsync(bookingId);
            return payment != null ? _mapper.Map<PaymentDTO>(payment) : null;
        }

        public async Task<PaymentDTO> GetPaymentByTransactionIdAsync(string transactionId)
        {
            var payment = await _paymentRepository.GetPaymentByTransactionIdAsync(transactionId);
            return payment != null ? _mapper.Map<PaymentDTO>(payment) : null;
        }

        public async Task<List<PaymentWithBookingInfoDTO>> GetAllPaymentsWithBookingInfoAsync()
        {
            var payments = await _paymentRepository.GetAllPaymentsAsync();
            return _mapper.Map<List<PaymentWithBookingInfoDTO>>(payments);
        }
    }
}
