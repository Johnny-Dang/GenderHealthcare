using backend.Application.DTOs.TestResultDTO;
using backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestResultController : ControllerBase
    {
        private readonly ITestResultService _testResultService;

        public TestResultController(ITestResultService testResultService)
        {
            _testResultService = testResultService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetAllTestResults()
        {
            var result = await _testResultService.GetAllTestResultsAsync();
            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return Ok(result.Data);
        }

        [HttpGet("{resultId}")]
        [Authorize(Roles = "Admin,Staff,Customer")]
        public async Task<IActionResult> GetTestResultById(Guid resultId)
        {
            var result = await _testResultService.GetTestResultByIdAsync(resultId);
            if (!result.IsSuccess)
                return NotFound(result.Error);

            return Ok(result.Data);
        }

        [HttpGet("booking-detail/{bookingDetailId}")]
        [Authorize(Roles = "Admin,Staff,Customer")]
        public async Task<IActionResult> GetTestResultsByBookingDetailId(Guid bookingDetailId)
        {
            var result = await _testResultService.GetTestResultsByBookingDetailIdAsync(bookingDetailId);
            if (!result.IsSuccess)
                return NotFound(result.Error);

            return Ok(result.Data);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> CreateTestResult([FromBody] CreateTestResultRequest request)
        {
            var result = await _testResultService.CreateTestResultAsync(request);
            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return CreatedAtAction(nameof(GetTestResultById), new { resultId = result.Data.ResultId }, result.Data);
        }

        [HttpPut("{resultId}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateTestResult(Guid resultId, [FromBody] UpdateTestResultRequest request)
        {
            var result = await _testResultService.UpdateTestResultAsync(resultId, request);
            if (!result.IsSuccess)
                return NotFound(result.Error);

            return Ok(result.Data);
        }

        [HttpDelete("{resultId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTestResult(Guid resultId)
        {
            var result = await _testResultService.DeleteTestResultAsync(resultId);
            if (!result.IsSuccess)
                return NotFound(result.Error);

            return NoContent();
        }

        [HttpGet("by-phone/{phone}")]
        [Authorize(Roles = "Admin,Staff,Consultant")]
        public async Task<IActionResult> GetTestResultsByPhone(string phone)
        {
            // validate phone number format
            if (string.IsNullOrWhiteSpace(phone))
                return BadRequest("Phone number is required.");

            var phonePattern = @"^(0\d{9}|(\+84)\d{9})$";
            if (!System.Text.RegularExpressions.Regex.IsMatch(phone, phonePattern))
                return BadRequest("Phone number must be a valid Vietnamese phone number (10 digits starting with 0 or +84).");

            // get test results by phone
            var result = await _testResultService.GetTestResultsByPhoneAsync(phone);
            if (!result.IsSuccess)
                return NotFound(result.Error);

            return Ok(result.Data);
        }
    }
}
