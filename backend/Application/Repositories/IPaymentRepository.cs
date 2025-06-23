using backend.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Application.Repositories
{
    public interface IPaymentRepository
    {
        Task<Payment> CreatePaymentAsync(Payment payment);
        Task<Payment> GetPaymentByBookingIdAsync(Guid bookingId);
        Task<Payment> GetPaymentByTransactionIdAsync(string transactionId);
        Task<List<Payment>> GetAllPaymentsAsync();
    }
}
