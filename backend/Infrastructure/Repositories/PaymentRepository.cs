using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Infrastructure.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly IApplicationDbContext _dbContext;

        public PaymentRepository(IApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Payment> CreatePaymentAsync(Payment payment)
        {
            _dbContext.Payment.Add(payment);
            await _dbContext.SaveChangesAsync();
            return payment;
        }

        public async Task<Payment> GetPaymentByBookingIdAsync(Guid bookingId)
        {
            return await _dbContext.Payment
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.BookingId == bookingId);
        }

        public async Task<Payment> GetPaymentByTransactionIdAsync(string transactionId)
        {
            return await _dbContext.Payment
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.TransactionId == transactionId);
        }

        public async Task<List<Payment>> GetAllPaymentsAsync()
        {
            return await _dbContext.Payment
                .Include(p => p.Booking)
                .ThenInclude(b => b.Account)
                .ToListAsync();
        }
    }
}
