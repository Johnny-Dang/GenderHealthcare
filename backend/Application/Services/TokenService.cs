using AutoMapper;
using backend.Application.DTOs.Accounts;
using backend.Application.Interfaces;
using backend.Domain.AppsettingsConfigurations;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using DeployGenderSystem.Application.Helpers;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Application.Services
{
    public class TokenService : ITokenService
    {
        private readonly IApplicationDbContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly IMemoryCache _cache;

        public TokenService(IApplicationDbContext context, IOptions<JwtSettings> jwtSettingOptions,IMemoryCache cache)
        {
            _context = context;
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
        public void DeleteOldRefreshToken(Guid userId)
        {
            var entity = _context.RefreshToken.Where(x => x.AccountId == userId).ToList();

            if (entity == null)
            {
                return;
            }
            _context.RefreshToken.RemoveRange(entity);
            _context.SaveChangesAsync();
        }
        public AccountDto GetUserByRefreshToken(string refreshToken)
        {
            var user = _context.RefreshToken
                .Include(rt => rt.Account)
                .ThenInclude(acc => acc.Role)
                .Where(rt => rt.Token == refreshToken
                     && !rt.IsRevoked
                     && rt.ExpiryDate > DateTime.UtcNow)
                .Select(rt =>
                new AccountDto
                {
                    User_Id = rt.Account.AccountId,
                    Email = rt.Account.Email,
                    FirstName = rt.Account.FirstName,
                    LastName = rt.Account.LastName,
                    Phone = rt.Account.Phone,
                    DateOfBirth = rt.Account.DateOfBirth,
                    RoleName = rt.Account.Role.Name // Quan trọng để truyền vào GenerateJwt
                })
                .FirstOrDefault();
            return user;
        }

        public string GenerateRefreshTokenAsync(Guid accountId)
        {
            // This method is not implemented in the original code, so we throw a NotImplementedException.
            string refreshToken = HashHelper.GenerateRamdomString(64);

            string hashedRefereshToken = HashHelper.BCriptHash(refreshToken);

            var data = new RefreshToken
            {
                AccountId = accountId,
                Token = hashedRefereshToken,
                ExpiryDate = DateTime.UtcNow.AddDays(7), // Refresh token valid for 7 days
                IsRevoked = false
            };

            _context.RefreshToken.Add(data);

            _context.SaveChangesAsync();

            return hashedRefereshToken;
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
