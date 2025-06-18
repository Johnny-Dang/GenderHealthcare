using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.BookingDetailDTO
{
    public class CreateBookingDetailRequest
    {
        [Required]
        public Guid BookingId { get; set; }
        
        [Required]
        public Guid ServiceId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = default!;
        
        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = default!;
        
        [Required]
        public DateOnly DateOfBirth { get; set; }
        
        public bool Gender { get; set; } = false;
    }
} 