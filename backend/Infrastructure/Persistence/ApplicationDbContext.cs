using backend.Application.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Persistence.Configurations;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {

        }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<StaffInfo> StaffInfos { get; set; }
        public DbSet<RefreshTokens> RefreshTokens { get; set; }

        //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        //{
        //    optionsBuilder.UseSqlServer("Server=DESKTOP-D98N0EU\\SQLEXPRESS;Database=QL_GenderService;Trusted_Connection=True;TrustServerCertificate=true");
        //}
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Load mapping configurations
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

            base.OnModelCreating(modelBuilder);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await base.SaveChangesAsync();
        }
    }
}
