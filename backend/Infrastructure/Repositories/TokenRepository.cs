using backend.Application.DTOs.Accounts;
using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories
{
    public class TokenRepository : ITokenRepository
    {
        private readonly IApplicationDbContext _context;

        public TokenRepository(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<RefreshToken>> GetRefreshTokensByUserIdAsync(Guid userId)
        {
            return await _context.RefreshToken
                .Where(x => x.AccountId == userId)
                .ToListAsync();
        }

        public async Task RemoveRefreshTokensAsync(List<RefreshToken> tokens)
        {
            if (tokens == null || !tokens.Any())
                return;

            _context.RefreshToken.RemoveRange(tokens);
            await _context.SaveChangesAsync();
        }

        public async Task<AccountDto> GetUserByRefreshTokenAsync(string refreshToken)
        {
            return await _context.RefreshToken
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
                    RoleName = rt.Account.Role.Name
                })
                .FirstOrDefaultAsync();
        }

        public async Task<string> CreateRefreshTokenAsync(RefreshToken refreshToken)
        {
            _context.RefreshToken.Add(refreshToken);
            await _context.SaveChangesAsync();
            return refreshToken.Token;
        }
    }
}
