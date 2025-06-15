using backend.Application.DTOs.ConsultationBookingDTO;
using backend.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConsultationBookingController : ControllerBase
    {
        private readonly IConsultationBookingService _bookingService;
        public ConsultationBookingController(IConsultationBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // api tạo booking tư vấn
        [HttpPost("book")]
        public async Task<IActionResult> CreateBooking([FromBody] CreateConsultationBookingRequest request)
        {
            if (request == null)
            {
                return BadRequest("Invalid booking request");
            }
            var result = await _bookingService.CreateBookingAsync(request);
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.Error); 
        }

        // api giúp cập nhật trạng thái booking
        [HttpPatch("{bookingId}/update-status")]
        public async Task<IActionResult> UpdateBookingStatus(Guid bookingId, [FromBody] string status)
        {
            if (string.IsNullOrEmpty(status))
            {
                return BadRequest("Status cannot be empty");
            }
            var result = await _bookingService.UpdateBookingStatusAsync(bookingId, status);
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.Error);
        }

        // api lấy tất cả booking của nhân viên
        [HttpGet("staff/{staffId}")]
        public async Task<IActionResult> GetBookingsByStaffId(Guid staffId)
        {
            var result = await _bookingService.GetBookingsByStaffIdAsync(staffId);
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return NotFound(result.Error);
        }

        // api lấy tất cả booking
        [HttpGet("all")]
        public async Task<IActionResult> GetAllBookings()
        {
            var result = await _bookingService.GetAllBookingsAsync();
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return NotFound(result.Error);
        }

        // api xóa booking
        [HttpDelete("{bookingId}")]
        public async Task<IActionResult> DeleteBooking(Guid bookingId)
        {
            var result = await _bookingService.DeleteBookingAsync(bookingId);
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return NotFound(result.Error);
        }

    }
}
