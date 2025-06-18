using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.BookingDTO
{
    public class CreateBookingRequest
    {
        [Required]
        public Guid AccountId { get; set; }
        
    }
} 