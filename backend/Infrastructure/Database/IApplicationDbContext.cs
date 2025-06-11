using backend.Domain.Entities;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Database
{
    public interface IApplicationDbContext
    {
        public DbSet<Account> Accounts { get; }
        public DbSet<Role> Roles { get; }
        public DbSet<StaffInfo> StaffInfos { get; }
        public DbSet<RefreshToken> RefreshTokens { get; }
        public DbSet<TestService> TestService { get; }

        public Task<int> SaveChangesAsync();
    }
}
