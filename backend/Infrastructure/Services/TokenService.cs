using AutoMapper;
using backend.Application.DTOs.Accounts;
using backend.Application.Interfaces;
using backend.Application.Repositories;
using backend.Domain.AppsettingsConfigurations;
using backend.Domain.Entities;
using DeployGenderSystem.Application.Helpers;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Infrastructure.Services
{
    public class TokenService : ITokenService
    {
        private readonly ITokenRepository _tokenRepository;
        private readonly JwtSettings _jwtSettings;
        private readonly IMemoryCache _cache;

        public TokenService(ITokenRepository tokenRepository, IOptions<JwtSettings> jwtSettingOptions, IMemoryCache cache)
        {
            _tokenRepository = tokenRepository;
            _jwtSettings = jwtSettingOptions.Value;
            _cache = cache;
        }   
        // Implement the methods defined in ITokenService
        public string GenerateJwt(AccountDto account)
        {
            var claims = new List<Claim>
            {
                new (ClaimTypes.NameIdentifier, account.User_Id.ToString()),
                new (ClaimTypes.Email, account.Email),
                new (ClaimTypes.Role, account.RoleName.ToString()),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
                signingCredentials: new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256Signature
                    )
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        public async Task DeleteOldRefreshToken(Guid userId)
        {
            var tokens = await _tokenRepository.GetRefreshTokensByUserIdAsync(userId);
            
            if (tokens == null || !tokens.Any())
            {
                return;
            }
            
            await _tokenRepository.RemoveRefreshTokensAsync(tokens);
        }
        public async Task<AccountDto> GetUserByRefreshToken(string refreshToken)
        {
            return await _tokenRepository.GetUserByRefreshTokenAsync(refreshToken);
        }

        public async Task<string> GenerateRefreshTokenAsync(Guid accountId)
        {
            string refreshToken = HashHelper.GenerateRamdomString(64);
            string hashedRefreshToken = HashHelper.BCriptHash(refreshToken);

            var data = new RefreshToken
            {
                AccountId = accountId,
                Token = hashedRefreshToken,
                ExpiryDate = DateTime.UtcNow.AddDays(7), // Refresh token valid for 7 days
                IsRevoked = false
            };

            return await _tokenRepository.CreateRefreshTokenAsync(data);
        }

        public void BlacklistToken(string token, DateTime expiry)
        {
            var options = new MemoryCacheEntryOptions
            {
                AbsoluteExpiration = expiry
            };

            _cache.Set(token, true, options);
        }

        public bool IsTokenBlacklisted(string token)
        {
            return _cache.TryGetValue(token, out _);
        }
    }
}
