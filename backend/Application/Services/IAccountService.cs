using backend.Application.DTOs.AccountDTO;
using backend.Application.DTOs.Accounts;
using backend.Application.DTOs.AdminDashboardDTO;
using DeployGenderSystem.Domain.Entity;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;

namespace backend.Application.Interfaces
{
    public interface IAccountService
    {
        public Task<Result<LoginResponse>> LoginAsync(LoginRequest request);
        public Task<Result<LoginResponse>> RefreshTokenAsync(string refreshToken);
        public Task<Result<bool>> LogoutAsync(Guid accountId);
        public Task<Result<AccountDto>> GetAccountByEmail(string email);
        public Task<Result<AccountDto>> CreateAsync(CreateAccountRequest request); // admin
        public Task<Result<AccountDto>> UpdateAsync(Guid id, UpdateAccountRequest request); // admin
        public Task<Result<bool>> DeleteAsync(Guid id); // admin
        public Task<Result<List<AccountResponse>>> GetAllAsync(); // admin
        public Task<Result<AccountResponse>> GetByIdAsync(Guid id); // fix
        public Task<Result<bool>> SendForgotPasswordCodeAsync(SendVerificationCodeRequest request);
        public Task<Result<bool>> ResetPasswordAsync(ResetPasswordRequest request);
        public Task<Result<bool>> SendVerificationCodeAsync(SendVerificationCodeRequest request);
        public Task<Result<AccountDto>> RegisterWithVerificationCodeAsync(RegisterWithVerificationCodeRequest request);
        public Task<List<UsersByRoleDto>> GetUsersCountByRoleAsync();
        public Task<List<RecentUserDto>> GetRecentUsersAsync(int count = 5);
        public Task<UserStatsDto> GetUserStatsAsync();
    }
}
