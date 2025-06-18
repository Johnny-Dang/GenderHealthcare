using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories
{
    public class GoogleCredentialRepository : IGoogleCredentialRepository
    {
        private readonly IApplicationDbContext _context;

        public GoogleCredentialRepository(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Account?> GetAccountByEmailAsync(string email)
        {
            return await _context.Account
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.Email == email);
        }

        public async Task<Account> CreateAccountAsync(Account account)
        {
            _context.Account.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task<Role?> GetRoleByNameAsync(string roleName)
        {
            return await _context.Role.FirstOrDefaultAsync(r => r.Name == roleName);
        }
    }
}
