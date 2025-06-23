using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.PaymentDTO
{
    public class CreateVnPayRequest
    {
        [Required]
        public Guid BookingId { get; set; }
        
        [Required]
        public double Amount { get; set; }

        [Required]
        public string OrderDescription { get; set; } = string.Empty;

        [Required]
        public string OrderType { get; set; } = "other";
        
    }
}
