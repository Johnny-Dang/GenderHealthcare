using backend.Application.DTOs.StaffInfoDTO;
using backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffInfoController : ControllerBase
    {
        private readonly IStaffInfoService _staffInfoService;

        public StaffInfoController(IStaffInfoService staffInfoService)
        {
            _staffInfoService = staffInfoService;
        }

        /// <summary>
        /// Get all staff information
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<StaffInfoDto>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetAll()
        {
            var staffInfoList = await _staffInfoService.GetAllAsync();
            return Ok(staffInfoList);
        }

        /// <summary>
        /// Get staff information by account ID
        /// </summary>
        [HttpGet("{accountId}")]
        [ProducesResponseType(typeof(StaffInfoDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> GetById(Guid accountId)
        {
            var staffInfo = await _staffInfoService.GetByIdAsync(accountId);
            if (staffInfo == null)
            {
                return NotFound($"Staff information for account ID {accountId} not found.");
            }

            return Ok(staffInfo);
        }

        /// <summary>
        /// Create new staff information
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(StaffInfoDto), (int)HttpStatusCode.Created)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateStaffInfoRequest request)
        {
            try
            {
                var staffInfo = await _staffInfoService.CreateAsync(request);
                return CreatedAtAction(nameof(GetById), new { accountId = staffInfo.AccountId }, staffInfo);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        /// <summary>
        /// Update staff information
        /// </summary>
        [HttpPut("{accountId}")]
        [Authorize(Roles = "Admin,Staff")]
        [ProducesResponseType(typeof(StaffInfoDto), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> Update(Guid accountId, [FromBody] UpdateStaffInfoRequest request)
        {
            var staffInfo = await _staffInfoService.UpdateAsync(accountId, request);
            if (staffInfo == null)
            {
                return NotFound($"Staff information for account ID {accountId} not found.");
            }

            return Ok(staffInfo);
        }

        /// <summary>
        /// Delete staff information
        /// </summary>
        [HttpDelete("{accountId}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType((int)HttpStatusCode.NoContent)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> Delete(Guid accountId)
        {
            var result = await _staffInfoService.DeleteAsync(accountId);
            if (!result)
            {
                return NotFound($"Staff information for account ID {accountId} not found.");
            }

            return NoContent();
        }
    }
}
