using backend.Application.DTOs.Accounts;
using backend.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/accounts")]
    [Authorize(Roles = "Admin")]

    public class AdminController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AdminController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _accountService.GetAllAsync();
            return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _accountService.GetByIdAsync(id);
            return result.IsSuccess ? Ok(result.Data) : NotFound(result.Error);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAccountRequest request)
        {
            var result = await _accountService.CreateAsync(request);
            return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateAccountRequest request)
        {
            var result = await _accountService.UpdateAsync(id, request);
            return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _accountService.DeleteAsync(id);
            return result.IsSuccess ? Ok(result.Data) : NotFound(result.Error);
        }

        // api/accounts/users-by-role
        // api/accounts/recent-users
        // api/accounts/user-stats

        [HttpGet("users-by-role")]
        public async Task<IActionResult> GetUsersByRole()
        {
            var result = await _accountService.GetUsersCountByRoleAsync();
            return Ok(result);
        }

        [HttpGet("recent-users")]
        public async Task<IActionResult> GetRecentUsers()
        {
            var result = await _accountService.GetRecentUsersAsync(5);
            return Ok(result);
        }

        [HttpGet("user-stats")]
        public async Task<IActionResult> GetUserStats()
        {
            var result = await _accountService.GetUserStatsAsync();
            return Ok(result);
        }
    }
}


