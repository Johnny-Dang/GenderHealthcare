using System;

namespace backend.Application.DTOs.PaymentDTO
{
    public class PaymentDTO
    {
        public Guid BookingId { get; set; }
        public Guid TransactionId { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
    }
} 