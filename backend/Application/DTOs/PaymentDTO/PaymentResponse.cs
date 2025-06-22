using System;

namespace backend.Application.DTOs.PaymentDTO
{
    public class PaymentResponse
    {
        public string OrderInfo { get; set; } = string.Empty;

        public string Amount { get; set; } = string.Empty;   
        
        public string TransactionId { get; set; } = string.Empty;
        
        public string PaymentMethod { get; set; } = string.Empty;
        
        public bool Success { get; set; }

        public string Token { get; set; } = string.Empty;   

        public string VnPayResponseCode { get; set; }
    }
}
