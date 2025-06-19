using backend.Application.DTOs.Accounts;
using backend.Domain.Entities;
using DeployGenderSystem.Domain.Entity;

namespace backend.Application.Repositories
{
    public interface IGoogleCredentialRepository
    {
        Task<Account?> GetAccountByEmailAsync(string email);
        Task<Account> CreateAccountAsync(Account account);
        Task<Role?> GetRoleByNameAsync(string roleName);
    }
}
