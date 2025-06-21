using System;
using System.Collections.Generic;

namespace backend.Application.DTOs.BookingDTO
{
    public class BookingResponse
    {
        public Guid BookingId { get; set; }
        public Guid AccountId { get; set; }
        public DateTime CreateAt { get; set; }
        public DateTime? UpdateAt { get; set; }
    }
} 