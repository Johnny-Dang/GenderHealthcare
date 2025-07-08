using System;

namespace backend.Application.DTOs.BookingDetailDTO
{
    public class BookingDetailResponse
    {
        public Guid BookingDetailId { get; set; }
        public Guid BookingId { get; set; }
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public Guid SlotId { get; set; }
        public DateOnly SlotDate { get; set; }
        public string SlotShift { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public DateOnly DateOfBirth { get; set; }
        public bool Gender { get; set; }
        public string? ResultFileUrl { get; set; }
    }
} 