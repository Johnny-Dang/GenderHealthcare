using backend.Application.Interfaces;
using backend.Domain.AppsettingsConfigurations;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using DeployGenderSystem.Application.Helpers;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;
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

        public TokenService(IApplicationDbContext context)
        {
            _context = context;
        }   
        // Implement the methods defined in ITokenService
        public string GenerateJwt(Account account)
        {
            var claims = new List<Claim>
            {
                new (ClaimTypes.NameIdentifier, account.User_Id.ToString()),
                new (ClaimTypes.Email, account.Email),
                new (ClaimTypes.Role, account.Role.ToString()),
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
            var entity = _context.RefreshTokens.Where(x => x.AccountId == userId).ToList();

            if (entity == null)
            {
                return;
            }
            _context.RefreshTokens.RemoveRange(entity);
            _context.SaveChangesAsync();
        }
        public Account GetUserByRefreshToken(string refreshToken)
        {
            var user = _context.RefreshTokens
                .Where(x => x.Token == refreshToken && !x.IsRevoked && x.ExpiryDate > DateTime.Now)
                .Select(x => x.Account)
                .FirstOrDefault();

            return user;
        }

        public string GenerateRefreshToken(Guid accountId)
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

            _context.RefreshTokens.Add(data);

            _context.SaveChangesAsync();

            return hashedRefereshToken;
        }
    }
}
