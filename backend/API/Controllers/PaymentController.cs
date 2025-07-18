using backend.Application.DTOs.PaymentDTO;
using backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        
        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }
        
        // POST: api/payments/create-vnpay-url
        [HttpPost("create-vnpay-url")]
        [Authorize]
        public IActionResult CreateVnPayUrl([FromBody] CreateVnPayRequest request)
        {
            var url = _paymentService.CreatePaymentUrl(request, HttpContext);
            return Ok(url);
        }
        
        // GET: api/payments/vnpay-callback
        [HttpGet("vnpay-callback")]
        [AllowAnonymous]
        [Authorize]
        public async Task<IActionResult> VnPayCallback()
        {
            var response = _paymentService.PaymentExecute(Request.Query);
            await _paymentService.StorePayment(response);
            return Ok(response);
        }
        
        // GET: api/payments/booking/{bookingId}
        [HttpGet("booking/{bookingId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PaymentDTO>> GetPaymentByBookingId(Guid bookingId)
        {
            var payment = await _paymentService.GetPaymentByBookingIdAsync(bookingId);
            if (payment == null)
                return NotFound();
                
            return Ok(payment);
        }
        
        // GET: api/payments/transaction/{transactionId}
        [HttpGet("transaction/{transactionId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PaymentDTO>> GetPaymentByTransactionId(string transactionId)
        {
            var payment = await _paymentService.GetPaymentByTransactionIdAsync(transactionId);
            if (payment == null)
                return NotFound();
                
            return Ok(payment);
        }
        
        // GET: api/payments/with-booking-info
        [HttpGet("with-booking-info")]
        [Authorize(Roles ="Staff,Manager,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<PaymentWithBookingInfoDTO>>> GetAllPaymentsWithBookingInfo()
        {
            var payments = await _paymentService.GetAllPaymentsWithBookingInfoAsync();
            return Ok(payments);
        }
    }
} 