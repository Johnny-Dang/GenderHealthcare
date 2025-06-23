using backend.Application.DTOs.BookingDetailDTO;
using backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/booking-details")]
    public class BookingDetailController : ControllerBase
    {
        private readonly IBookingDetailService _bookingDetailService;
        
        public BookingDetailController(IBookingDetailService bookingDetailService)
        {
            _bookingDetailService = bookingDetailService;
        }
        
        // POST: api/booking-details
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateBookingDetailRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
                
            var bookingDetail = await _bookingDetailService.CreateAsync(request);
            
            if (bookingDetail == null)
                return NotFound("Booking not found");
                
            return Ok(bookingDetail);
        }
        
        // GET: api/booking-details/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var bookingDetail = await _bookingDetailService.GetByIdAsync(id);
            
            if (bookingDetail == null)
                return NotFound();
                
            return Ok(bookingDetail);
        }
        
        // GET: api/booking-details/booking/{bookingId}
        [HttpGet("booking/{bookingId}")]
        [Authorize]
        public async Task<IActionResult> GetByBookingId(Guid bookingId)
        {
            var bookingDetails = await _bookingDetailService.GetByBookingIdAsync(bookingId);
            return Ok(bookingDetails);
        }
        
        // GET: api/booking-details/booking/{bookingId}/total
        [HttpGet("booking/{bookingId}/total")]
        [Authorize]
        public async Task<IActionResult> GetTotalAmountByBookingId(Guid bookingId)
        {
            var totalAmount = await _bookingDetailService.CalculateTotalAmountByBookingIdAsync(bookingId);
            
            if (totalAmount == null)
                return NotFound("Booking not found");
                
            return Ok(totalAmount);
        }
        
        // PUT: api/booking-details
        [HttpPut]
        [Authorize]
        public async Task<IActionResult> Update([FromBody] UpdateBookingDetailRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
                
            var updatedBookingDetail = await _bookingDetailService.UpdateAsync(request);
            
            if (updatedBookingDetail == null)
                return NotFound();
                
            return Ok(updatedBookingDetail);
        }
        
        // DELETE: api/booking-details/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _bookingDetailService.DeleteAsync(id);
            
            if (!result)
                return NotFound();
                
            return NoContent();
        }
    }
}
