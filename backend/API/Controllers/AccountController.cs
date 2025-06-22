using AutoMapper;
using backend.Application.DTOs.Accounts;
using backend.Application.Interfaces;
using backend.Application.Services;
using backend.Infrastructure.Database;
using DeployGenderSystem.Application.Helpers;
using DeployGenderSystem.Domain.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.IdentityModel.Tokens.Jwt;

namespace backend.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly ITokenService _tokenService;
        private readonly IGoogleCredentialService _googleCredentialService;
        public AccountController(IAccountService accountService, ITokenService tokenService, IGoogleCredentialService googleCredentialService)
        {
            _accountService = accountService;
            _tokenService = tokenService;
            _googleCredentialService = googleCredentialService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _accountService.LoginAsync(request);
            if (!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                Expires = DateTime.Now.AddDays(7),
                SameSite = SameSiteMode.None, // Thêm dòng này!
            };

            HttpContext.Response.Cookies.Append("refreshToken", result.Data.RefreshToken, cookieOptions);
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
            
            var result = await _accountService.RefreshTokenAsync(refreshToken);
            if (!result.IsSuccess)
            {
                return Unauthorized(result.Error);
            }
            
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                Expires = DateTime.Now.AddDays(7),
                SameSite = SameSiteMode.None, // Thêm dòng này!
            };

            HttpContext.Response.Cookies.Append("refreshToken", result.Data.RefreshToken, cookieOptions);
            return Ok(result.Data);
        }

        [HttpPost("login-google")]
        public async Task<IActionResult> LoginGoogle(GoogleLoginDto model)
        {
            var result = await _googleCredentialService.LoginGoogleAsync(model);
            if (!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                Expires = DateTime.Now.AddDays(7),
                SameSite = SameSiteMode.None, // Thêm dòng này!
            };
            
            HttpContext.Response.Cookies.Append("refreshToken", result.Data.RefreshToken, cookieOptions);
            return Ok(result.Data);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            // Get user ID from claims
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return BadRequest("Invalid user identification");
            }

            // Get the access token from the Authorization header
            string accessToken = null;
            if (Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                var authHeaderValue = authHeader.FirstOrDefault();
                if (!string.IsNullOrEmpty(authHeaderValue) && authHeaderValue.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    accessToken = authHeaderValue.Substring("Bearer ".Length).Trim();
                }
            }

            // Blacklist the access token if available
            if (!string.IsNullOrEmpty(accessToken))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var token = handler.ReadJwtToken(accessToken);
                    var expiry = token.ValidTo;
                    _tokenService.BlacklistToken(accessToken, expiry);
                }
                catch
                {
                    // Continue even if token parsing fails
                }
            }

            var result = await _accountService.LogoutAsync(userId);
            if (!result.IsSuccess)
            {
                return BadRequest(result.Error);
            }
            
            HttpContext.Response.Cookies.Delete("refreshToken");
            return Ok("Logout successful");
        }

        [HttpPost("send-verification-code")]
        public async Task<IActionResult> SendVerificationCode([FromBody] SendVerificationCodeRequest request)
        {
            var result = await _accountService.SendVerificationCodeAsync(request);
            if (!result.IsSuccess)
                return BadRequest(result.Error);
            return Ok(new { message = "Verification code sent successfully." });
        }

        [HttpPost("register-with-code")]
        public async Task<IActionResult> RegisterWithVerificationCodeAsync(RegisterWithVerificationCodeRequest request)
        {
            var result = await _accountService.RegisterWithVerificationCodeAsync(request);
            if (!result.IsSuccess)
                return BadRequest(result.Error);
                
            return Ok(new { message = "Register successfully." });
        }
        [HttpPost("forgot-password/send-code")]
        public async Task<IActionResult> SendForgotPasswordCode([FromBody] SendVerificationCodeRequest request)
        {
            var result = await _accountService.SendForgotPasswordCodeAsync(request);
            if (!result.IsSuccess)
                return BadRequest(result.Error);
            return Ok(new { message = "Verification code sent successfully." });
        }

        [HttpPost("forgot-password/reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var result = await _accountService.ResetPasswordAsync(request);
            if (!result.IsSuccess)
                return BadRequest(result.Error);
            return Ok(new { message = "Password reset successfully." });
        }
    }
}
