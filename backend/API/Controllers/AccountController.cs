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
            _tokenService.DeleteOldRefreshToken(result.Data.AccountId);
            var newRefreshToken = _tokenService.GenerateRefreshTokenAsync(result.Data.AccountId);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                Expires = DateTime.Now.AddDays(7)
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
                Expires = DateTime.Now.AddDays(7)
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
                Expires = DateTime.Now.AddDays(7)
            };
            
            HttpContext.Response.Cookies.Append("refreshToken", result.Data.RefreshToken, cookieOptions);
            return Ok(result.Data);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout(Guid accountId)
        {
            var result = await _accountService.LogoutAsync(accountId);
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
                
            return CreatedAtAction(nameof(RegisterWithVerificationCodeAsync), new { id = result.Data!.User_Id }, result.Data);
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
