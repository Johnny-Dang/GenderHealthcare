using backend.Application.DTOs.Accounts;
using DeployGenderSystem.Domain.Entity;

namespace backend.Application.Interfaces
{
    public interface IAccountService
    {
        //public Task<Result<AccountDto>> RegisterAsync(RegisterRequest request);

        //public Task<Result<LoginResponse>> LoginAsync(LoginRequest request);

        public Task<Result<AccountDto>> CreateAsync(CreateAccountRequest request); // admin
        public Task<Result<AccountDto>> UpdateAsync(Guid id, UpdateAccountRequest request); // admin
        public Task<Result<bool>> DeleteAsync(Guid id); // admin
        public Task<Result<List<AccountDto>>> GetAllAsync(); // admin
        public Task<Result<AccountDto>> GetByIdAsync(Guid id); // admin
    }
}
