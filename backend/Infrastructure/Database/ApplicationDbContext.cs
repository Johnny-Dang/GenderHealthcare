using backend.Domain.Entities;
using backend.Infrastructure.Persistence.Configurations;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Database
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
<<<<<<< HEAD
=======
        

>>>>>>> 25398802ccaf59c8854454fadc182bac45b55c85
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<StaffInfo> StaffInfos { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
<<<<<<< HEAD
        public DbSet<Appoiment> Appoiment { get; set; }
        public DbSet<TestService> TestService { get; set; }
        public DbSet<TestResult> TestResult { get; set; }
=======
        public DbSet<TestService> TestService { get; set; }

>>>>>>> 25398802ccaf59c8854454fadc182bac45b55c85
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {

        }
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
