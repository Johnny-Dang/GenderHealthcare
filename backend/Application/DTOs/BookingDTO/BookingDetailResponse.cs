using System;

namespace backend.Application.DTOs.BookingDTO
{
    public class BookingDetailResponse
    {
        public Guid BookingDetailId { get; set; }
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public DateOnly DateOfBirth { get; set; }
        public bool Gender { get; set; }
    }
} 