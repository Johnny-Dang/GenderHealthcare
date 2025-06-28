using System;

namespace backend.Application.DTOs.BookingDTO
{
    public class BookingWithPaymentResponse
    {
        public Guid BookingId { get; set; }
        public Guid AccountId { get; set; }
        public string Status { get; set; } = "chờ xác nhận";
        public DateTime CreateAt { get; set; }
        public DateTime? UpdateAt { get; set; }
        
        // Payment information
        public bool HasPayment { get; set; }
        public decimal? PaymentAmount { get; set; }
        public string? PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
        public DateTime? PaymentCreatedAt { get; set; }
    }
} 