using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.PaymentDTO
{
    public class CreateVnPayRequest
    {
        [Required]
        public Guid BookingId { get; set; }
        
        [Required]
        public decimal Amount { get; set; }
        
        [Required]
        public string OrderDescription { get; set; } = string.Empty;
        
        public string OrderType { get; set; } = "other";
        
    }
}
