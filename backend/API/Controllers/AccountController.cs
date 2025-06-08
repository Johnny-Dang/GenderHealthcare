using backend.Application.DTOs.Accounts;
using backend.Application.Interfaces;
using backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly ITokenService _tokenService;
        public AccountController(IAccountService accountService, ITokenService tokenService)
        {
            _accountService = accountService;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        //[AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _accountService.RegisterAsync(request);
            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return CreatedAtAction(nameof(Register), new { id = result.Data!.User_Id }, result.Data);
        }

        [HttpPost("login")]
        //[AllowAnonymous]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _accountService.LoginAsync(request);
            if (!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            var newRefreshToken = _tokenService.GenerateRefreshTokenAsync(result.Data.AccountId);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,//use secure cookies in production
                Expires = DateTime.Now.AddDays(7)//SetExpiration for the cookie
            };

            //set the refresh token in the cookie
            HttpContext.Response.Cookies.Append("refreshToken", newRefreshToken, cookieOptions);
            return Ok(result.Data);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var isExit = HttpContext.Request.Cookies.TryGetValue("refreshToken", out var refreshToken);

            if (!isExit)
            {
                return Unauthorized("Refresh token is not found");
            }
            var user = _tokenService.GetUserByRefreshToken(refreshToken!);

            if (user == null)
            {
                return Unauthorized("Refresh token is not found");
            }
            //Delete old refresh token
            _tokenService.DeleteOldRefreshToken(user.User_Id);

            //generate new access token and refresh token
            var accessToken = _tokenService.GenerateJwt(user);
            var loginResponse = new LoginResponse
            {
                AccessToken = accessToken,
                Email = user.Email,
                Role = user.RoleName,
                AccountId = user.User_Id
            };
            var newRefreshToken = _tokenService.GenerateRefreshTokenAsync(user.User_Id);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,//use secure cookies in production
                Expires = DateTime.Now.AddDays(7)//SetExpiration for the cookie
            };

            //set the refresh token in the cookie
            HttpContext.Response.Cookies.Append("refreshToken", newRefreshToken, cookieOptions);
            return Ok(loginResponse);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            //delete the refresh token cookie
            HttpContext.Response.Cookies.Delete("refreshToken");
            return Ok("Logout successful");
        }
    }
}
