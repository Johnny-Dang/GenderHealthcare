using backend.Application.DTOs.ConsultationBookingDTO;
using backend.Application.Services;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
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
        [AllowAnonymous]
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

        //GET /api/ConsultationBooking/{customerId}
        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetBooKingsByCustomerId(Guid customerId)
        {
            var result = await _bookingService.GetBookingsByCustomerIdAsync(customerId);
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return NotFound(result.Error);
        }

        // api giúp cập nhật trạng thái booking
        [HttpPatch("{bookingId}/status")]
        public async Task<IActionResult> UpdateBookingStatus(Guid bookingId, [FromBody] string status)
        {
            if (string.IsNullOrEmpty(status))
            {
                return BadRequest("Status cannot be empty");
            }
            
            var validStatuses = new[] 
            { 
                ConsultationBookingStatus.Pending, 
                ConsultationBookingStatus.Confirmed, 
                ConsultationBookingStatus.Cancelled 
            };
            
            if (!validStatuses.Contains(status))
            {
                return BadRequest($"Status must be one of: {string.Join(", ", validStatuses)}");
            }
            
            var result = await _bookingService.UpdateBookingStatusAsync(bookingId, status);
            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }
            return BadRequest(result.Error);
        }

        // api lấy tất cả booking của nhân viên
        [HttpGet("consultant/{consultantId}")]
        public async Task<IActionResult> GetBookingsByStaffId(Guid consultantId)
        {
            var result = await _bookingService.GetBookingsByStaffIdAsync(consultantId);
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
