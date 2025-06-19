using backend.Application.DTOs.Accounts;
using backend.Domain.Entities;
using DeployGenderSystem.Domain.Entity;

namespace backend.Application.Repositories
{
    public interface ITokenRepository
    {
        Task<List<RefreshToken>> GetRefreshTokensByUserIdAsync(Guid userId);
        Task RemoveRefreshTokensAsync(List<RefreshToken> tokens);
        Task<AccountDto> GetUserByRefreshTokenAsync(string refreshToken);
        Task<string> CreateRefreshTokenAsync(RefreshToken refreshToken);
    }
}
