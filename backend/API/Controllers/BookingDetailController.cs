﻿using backend.Application.DTOs.BookingDetailDTO;
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
                return BadRequest("Không thể tạo booking detail. Có thể booking không tồn tại, slot đã đầy hoặc dữ liệu không hợp lệ.");

            return CreatedAtAction(nameof(GetById), new { id = bookingDetail.BookingDetailId }, bookingDetail);
        }

        // GET: api/booking-details/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var bookingDetail = await _bookingDetailService.GetByIdAsync(id);

            if (bookingDetail == null)
                return NotFound("Không tìm thấy booking detail.");

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
                return NotFound("Không tìm thấy booking.");

            return Ok(totalAmount);
        }

        // PUT: api/booking-details/{bookingDetailId}
        [HttpPut("{bookingDetailId}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> Update(Guid bookingDetailId, [FromBody] UpdateBookingDetailRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedBookingDetail = await _bookingDetailService.UpdateInfoOnlyAsync(bookingDetailId, request);

            if (updatedBookingDetail == null)
                return NotFound("Không tìm thấy booking detail để cập nhật.");

            return Ok(updatedBookingDetail);
        }

        // PUT: api/booking-details/{id}/status
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Staff,Manager")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                return BadRequest("Trạng thái không hợp lệ.");

            var result = await _bookingDetailService.UpdateStatusAsync(id, status);
            if (result == null)
                return NotFound("Không tìm thấy booking detail để cập nhật trạng thái.");

            return Ok(result);
        }

        // DELETE: api/booking-details/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _bookingDetailService.DeleteAsync(id);

            if (!result)
                return NotFound("Không tìm thấy booking detail để xóa.");

            return NoContent();
        }
    }
}
