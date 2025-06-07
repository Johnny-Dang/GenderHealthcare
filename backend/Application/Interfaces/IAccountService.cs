using backend.Application.DTOs.Accounts;
using DeployGenderSystem.Domain.Entity;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;

namespace backend.Application.Interfaces
{
    public interface IAccountService
    {
        public Task<Result<AccountDto>> RegisterAsync(RegisterRequest request);

        public Task<Result<LoginResponse>> LoginAsync(LoginRequest request);

        public Task<GoogleJsonWebSignature.Payload> VerifyCredential(string clientId, string credential);

        public Task<Result<AccountDto>> CreateAsync(CreateAccountRequest request); // admin
        public Task<Result<AccountDto>> UpdateAsync(Guid id, UpdateAccountRequest request); // admin
        public Task<Result<bool>> DeleteAsync(Guid id); // admin
        public Task<Result<List<AccountDto>>> GetAllAsync(); // admin
        public Task<Result<AccountDto>> GetByIdAsync(Guid id); // admin
    }
}
