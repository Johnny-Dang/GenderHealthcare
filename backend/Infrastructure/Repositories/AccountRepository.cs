using backend.Application.DTOs.AdminDashboardDTO;
using backend.Application.Interfaces;
using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly IApplicationDbContext _context;

        public AccountRepository(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Account?> GetAccountByEmailAsync(string email)
        {
            return await _context.Account.FirstOrDefaultAsync(a => a.Email == email);
        }

        public async Task<Account?> GetAccountByEmailWithRoleAsync(string email)
        {
            return await _context.Account
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.Email == email);
        }

        public async Task<Account?> GetAccountByIdAsync(Guid id)
        {
            return await _context.Account.FindAsync(id);
        }

        public async Task<Account?> GetAccountByIdWithRoleAsync(Guid id)
        {
            return await _context.Account
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.AccountId == id);
        }

        public async Task<List<Account>> GetAllAccountsAsync()
        {
            return await _context.Account
                .IgnoreQueryFilters()
                .Include(a => a.Role)
                .Where(x => x.Role.Name != "Admin")
                .ToListAsync();
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Account.AnyAsync(a => a.Email == email);
        }

        public async Task<Role?> GetRoleByNameAsync(string roleName)
        {
            return await _context.Role.FirstOrDefaultAsync(r => r.Name == roleName);
        }

        public async Task<Account> CreateAccountAsync(Account account)
        {
            _context.Account.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task<bool> UpdateAccountAsync(Account account)
        {
            _context.Account.Update(account);
            return await _context.SaveChangesAsync() > 0;
            
        }

        public async Task<bool> DeleteAccountAsync(Guid id)
        {
            var account = await _context.Account.FindAsync(id);
            if (account == null) return false;

            account.IsDeleted = true;
            _context.Account.Update(account);

            var affectedRows = await _context.SaveChangesAsync();
            return affectedRows > 0;

        }

        public async Task<Account?> GetAccountByIdWithRoleAndStaffInfoAsync(Guid id)
        {
            return await _context.Account
                .Include(a => a.Role)
                .Include(a => a.StaffInfo)
                .FirstOrDefaultAsync(a => a.AccountId == id);
        }

        public async Task<List<UsersByRoleDto>> GetUsersCountByRoleAsync()
        {
            return await _context.Account
                .Where(a => !a.IsDeleted)
                .GroupBy(a => a.Role.Name)
                .Select(g => new UsersByRoleDto
                {
                    RoleName = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();
        }

        public async Task<List<RecentUserDto>> GetRecentUsersAsync(int count = 5)
        {
            return await _context.Account
                .OrderByDescending(a => a.CreateAt)
                .Take(count)
                .Select(a => new RecentUserDto
                {
                    AccountId = a.AccountId,
                    Email = a.Email,
                    FullName = $"{a.FirstName} {a.LastName}",
                    CreateAt = a.CreateAt,
                    IsActive = !a.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<UserStatsDto> GetUserStatsAsync()
        {
            var total = await _context.Account.IgnoreQueryFilters().CountAsync();
            var active = await _context.Account.IgnoreQueryFilters().CountAsync(a => !a.IsDeleted);
            var inactive = await _context.Account.IgnoreQueryFilters().CountAsync(a => a.IsDeleted);
            return new UserStatsDto
            {
                Total = total,
                Active = active,
                Inactive = inactive
            };
        }
    }
}
