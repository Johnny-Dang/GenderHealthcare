using backend.Application.DTOs.BookingDTO;
using backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        
        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }
        
        // GET: api/bookings
        [HttpGet]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BookingResponse>>> GetAll()
        {
            var bookings = await _bookingService.GetAllAsync();
            return Ok(bookings);
        }
        
        // GET: api/bookings/{id}
        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BookingResponse>> GetById(Guid id)
        {
            var booking = await _bookingService.GetByIdAsync(id);
            if (booking == null)
                return NotFound();
                
            return Ok(booking);
        }
        
        // GET: api/bookings/account/{accountId}
        [HttpGet("account/{accountId}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByAccountId(Guid accountId)
        {
            var result = await _bookingService.GetByAccountIdAsync(accountId);
            return Ok(result);
        }
        
        // POST: api/bookings
        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateBookingRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
                
            var booking = await _bookingService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = booking.BookingId }, booking);
        }
        
        // PUT: api/bookings
        [HttpPut]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update([FromBody] UpdateBookingRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
                
            var booking = await _bookingService.UpdateAsync(request);
            if (booking == null)
                return NotFound();
                
            return Ok(booking);
        }
        
        // DELETE: api/bookings/{id}
        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _bookingService.DeleteAsync(id);
            if (!result)
                return NotFound();
                
            return NoContent();
        }
    }
}
