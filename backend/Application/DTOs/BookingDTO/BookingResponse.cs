using System;
using System.Collections.Generic;

namespace backend.Application.DTOs.BookingDTO
{
    public class BookingResponse
    {
        public Guid BookingId { get; set; }
        public Guid AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public DateTime CreateAt { get; set; }
        public DateTime? UpdateAt { get; set; }
        public string Phone { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public List<BookingDetailResponse> BookingDetails { get; set; } = new List<BookingDetailResponse>();
    }
} 