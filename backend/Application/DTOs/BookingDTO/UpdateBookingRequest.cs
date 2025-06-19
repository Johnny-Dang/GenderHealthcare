using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace backend.Application.DTOs.BookingDTO
{
    public class UpdateBookingRequest
    {
        [Required]
        public Guid BookingId { get; set; }
        
        // No AccountId update to preserve the booking owner
        
        public List<UpdateBookingDetailDTO> BookingDetails { get; set; } = new List<UpdateBookingDetailDTO>();
    }
} 