using backend.Application.DTOs.Accounts;
using DeployGenderSystem.Domain.Entity;

namespace backend.Application.Interfaces
{
    public interface IAccountService
    {
        public Task<Result<AccountDto>> RegisterAsync(CreateAccountRequest request);

        public Task<Result<LoginResponse>> LoginAsync(LoginRequest request);
        //public Account? LoginAccount(LoginAccountModel user);

        //string GenerateJwt(Account user);
    }
}
