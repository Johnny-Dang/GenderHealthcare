using backend.Application.DTOs.Accounts;
using backend.Application.Interfaces;
using backend.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccountController : Controller
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateAccountRequest request)
        {
            var result = await _accountService.RegisterAsync(request);
            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return CreatedAtAction(nameof(Register), new { id = result.Data!.User_Id }, result.Data);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _accountService.LoginAsync(request);
            return result.IsSuccess ? Ok(result.Data) : BadRequest(result.Error);
        }
    }
}
