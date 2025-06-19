using System;

namespace backend.Application.DTOs.BookingDetailDTO
{
    public class BookingTotalAmountResponse
    {
        public Guid BookingId { get; set; }
        public decimal TotalAmount { get; set; }
        public int ServiceCount { get; set; }
    }
} 