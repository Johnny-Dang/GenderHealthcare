using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.BookingDetailDTO
{
    public class UpdateBookingDetailRequest
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = default!;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = default!;

        [Required]
        public DateOnly DateOfBirth { get; set; }

        [Required]
        [StringLength(20)]
        public string Phone { get; set; } = default!;

        public bool Gender { get; set; } = false;

        public DateOnly? SlotDate { get; set; }

        [RegularExpression("^(AM|PM)$", ErrorMessage = "Shift phải là 'AM' hoặc 'PM'")]
        public string? Shift { get; set; }
    }
}