using backend.Application.DTOs.PaymentDTO;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Application.Services
{
    public interface IPaymentService
    {
        string CreatePaymentUrl(CreateVnPayRequest model, HttpContext context);
        PaymentResponse PaymentExecute(IQueryCollection collections);
        Task<PaymentResponse> StorePayment(PaymentResponse response);
        
        // Additional methods for payment operations
        Task<PaymentDTO> GetPaymentByBookingIdAsync(Guid bookingId);
        Task<PaymentDTO> GetPaymentByTransactionIdAsync(string transactionId);
        Task<List<PaymentWithCustomerDTO>> GetAllPaymentsWithCustomerAsync();
    }
}
