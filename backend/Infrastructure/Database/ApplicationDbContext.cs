using backend.Domain.Entities;
using backend.Infrastructure.Persistence.Configurations;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Database
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        
        public DbSet<Account> Account { get; set; }
        public DbSet<Role> Role { get; set; }
        public DbSet<StaffInfo> StaffInfo { get; set; }
        public DbSet<RefreshToken> RefreshToken { get; set; }
        public DbSet<Booking> Booking { get; set; }
        public DbSet<TestService> TestService { get; set; }
        public DbSet<TestResult> TestResult { get; set; }

        public DbSet<Blog> Blog { get; set; }
        public DbSet<BlogCategory> BlogCategory { get; set; }
        public DbSet<Payment> Payment { get; set; }
        public DbSet<BookingDetail> BookingDetail { get ; set ; }
        public DbSet<Feedback> Feedback { get ; set; }

        public DbSet<ConsultationBooking> ConsultationBooking { get; set; }

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
            // mấy thằng bị xóa mềm là ban nè
            modelBuilder.Entity<Account>().HasQueryFilter(a => !a.IsDeleted);

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
