using backend.Application.DTOs.Accounts;
using DeployGenderSystem.Domain.Entity;

namespace backend.Application.Interfaces
{
    public interface ITokenService
    {
        public string GenerateJwt(AccountDto user);

        public string GenerateRefreshTokenAsync(Guid accountId);

        public AccountDto GetUserByRefreshToken(string refreshToken);

        public void DeleteOldRefreshToken(Guid accountId);
    }
}
