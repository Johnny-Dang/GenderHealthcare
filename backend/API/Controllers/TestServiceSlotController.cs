using backend.Application.DTOs.TestServiceSlotDTO;
using backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestServiceSlotController : ControllerBase
    {
        private readonly ITestServiceSlotService _slotService;

        public TestServiceSlotController(ITestServiceSlotService slotService)
        {
            _slotService = slotService;
        }
        // GET: api/TestServiceSlot/{slotId}
        [HttpGet("{slotId}")]
        public async Task<IActionResult> GetSlotById(Guid slotId)
        {
            var result = await _slotService.GetSlotByIdAsync(slotId);
            if (!result.IsSuccess)
                return NotFound(result.Error);

            return Ok(result.Data);
        }

        // GET: api/TestServiceSlot/service/{serviceId}
        [HttpGet("service/{serviceId}")]
        public async Task<IActionResult> GetSlotsByServiceId(Guid serviceId)
        {
            var result = await _slotService.GetSlotsByServiceIdAsync(serviceId);
            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return Ok(result.Data);
        }

        // GET: api/TestServiceSlot/service/{serviceId}/date/{date}
        [HttpGet("service/{serviceId}/date/{date}")]
        public async Task<IActionResult> GetSlotsByServiceIdAndDate(Guid serviceId, DateOnly date)
        {
            var result = await _slotService.GetSlotsByServiceIdAndDateAsync(serviceId, date);
            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return Ok(result.Data);
        }

        // POST: api/TestServiceSlot
        [HttpPost]
        [Authorize(Roles = "Admin,Staff,Manager")]
        public async Task<IActionResult> CreateSlot([FromBody] CreateTestServiceSlotRequest request)
        {
            var result = await _slotService.CreateSlotAsync(request);
            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return CreatedAtAction(nameof(GetSlotById), new { slotId = result.Data.SlotId }, result.Data);
        }

        // PUT: api/TestServiceSlot/{slotId}
        [HttpPut("{slotId}")]
        [Authorize(Roles = "Admin,Staff,Manager")]
        public async Task<IActionResult> UpdateSlot(Guid slotId, [FromBody] UpdateTestServiceSlotRequest request)
        {
            var result = await _slotService.UpdateSlotAsync(slotId, request);
            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return Ok(result.Data);
        }

        // DELETE: api/TestServiceSlot/{slotId}
        [HttpDelete("{slotId}")]
        [Authorize(Roles = "Admin,Staff,Manager")]
        public async Task<IActionResult> DeleteSlot(Guid slotId)
        {
            var result = await _slotService.DeleteSlotAsync(slotId);
            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return NoContent();
        }

        // GET: api/TestServiceSlot/{slotId}/available
        [HttpGet("{slotId}/available")]
        public async Task<IActionResult> CheckAvailability(Guid slotId)
        {
            var result = await _slotService.HasAvailableCapacityAsync(slotId);
            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return Ok(new { isAvailable = result.Data });
        }
    }
}

