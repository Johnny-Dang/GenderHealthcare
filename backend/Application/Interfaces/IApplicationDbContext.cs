using backend.Domain.Entities;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Interfaces
{
    public interface IApplicationDbContext
    {
        public DbSet<Account> Accounts { get; }
        public DbSet<Role> Roles { get; }
        public DbSet<StaffInfo> StaffInfos { get; }
        public DbSet<RefreshTokens> RefreshTokens { get; }

        public Task<int> SaveChangesAsync();
    }
}
