using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.BookingDTO
{
    public class UpdateBookingDetailDTO
    {
        public Guid BookingDetailId { get; set; }

        public Guid ServiceId { get; set; }

        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Phone]
        public string Phone { get; set; } = string.Empty;

        public DateOnly DateOfBirth { get; set; } = new DateOnly();

        public bool Gender { get; set; }
    }
} 