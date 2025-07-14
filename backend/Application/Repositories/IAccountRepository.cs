using backend.Application.DTOs.Accounts;
using backend.Application.DTOs.AdminDashboardDTO;
using backend.Domain.Entities;
using DeployGenderSystem.Domain.Entity;

namespace backend.Application.Repositories
{
    public interface IAccountRepository
    {
        Task<Account?> GetAccountByEmailAsync(string email);
        Task<Account?> GetAccountByEmailWithRoleAsync(string email);
        Task<Account?> GetAccountByIdAsync(Guid id);
        Task<Account?> GetAccountByIdWithRoleAsync(Guid id);
        Task<List<Account>> GetAllAccountsAsync();
        Task<bool> EmailExistsAsync(string email);
        Task<Role?> GetRoleByNameAsync(string roleName);
        Task<Account> CreateAccountAsync(Account account);
        Task<bool> UpdateAccountAsync(Account account);
        Task<bool> DeleteAccountAsync(Guid id);
        Task<Account?> GetAccountByIdWithRoleAndStaffInfoAsync(Guid id);
        Task<List<UsersByRoleDto>> GetUsersCountByRoleAsync();
        Task<List<RecentUserDto>> GetRecentUsersAsync(int count = 5);
        Task<UserStatsDto> GetUserStatsAsync();
    }
}
