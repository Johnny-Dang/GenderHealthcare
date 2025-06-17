using backend.Application.DTOs.Accounts;
using DeployGenderSystem.Domain.Entity;

namespace backend.Application.Interfaces
{
    public interface ITokenService
    {
        string GenerateJwt(AccountDto user);

        Task<string> GenerateRefreshTokenAsync(Guid accountId);

        Task<AccountDto> GetUserByRefreshToken(string refreshToken);

        Task DeleteOldRefreshToken(Guid accountId);

        void BlacklistToken(string token, DateTime expiry);
        bool IsTokenBlacklisted(string token);
    }
}
