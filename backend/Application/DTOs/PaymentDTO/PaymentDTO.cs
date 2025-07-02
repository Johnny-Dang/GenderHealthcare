using System;

namespace backend.Application.DTOs.PaymentDTO
{
    public class PaymentDTO
    {
        public Guid BookingId { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
    }

    public class PaymentWithCustomerDTO
    {
        public Guid BookingId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool Gender { get; set; }
    }
} 