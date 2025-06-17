using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.BookingDetailDTO
{
    public class UpdateBookingDetailRequest
    {
        [Required]
        public Guid BookingDetailId { get; set; }
        
        [Required]
        public Guid ServiceId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [Phone]
        public string Phone { get; set; } = string.Empty;
        
        [Required]
        public DateOnly DateOfBirth { get; set; }
        
        public bool Gender { get; set; } = false;
    }
} 