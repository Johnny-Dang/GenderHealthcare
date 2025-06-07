using DeployGenderSystem.Domain.Entity;

namespace backend.Application.Interfaces
{
    public interface ITokenService
    {
        public string GenerateJwt(Account user);

        public string GenerateRefreshToken(Guid accountId);

        public Account GetUserByRefreshToken(string refreshToken);

        public void DeleteOldRefreshToken(Guid accountId);
    }
}
