using backend.Domain.Entities;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Database
{
    public interface IApplicationDbContext
    {
        public DbSet<Account> Account { get; set; }
        public DbSet<Role> Role { get; set; }
        public DbSet<StaffInfo> StaffInfo { get; set; }
        public DbSet<RefreshToken> RefreshToken { get; set; }
        public DbSet<Booking> Booking { get; set; }
        public DbSet<Service> Service { get; set; }
        public DbSet<TestResult> TestResult { get; set; }

        public DbSet<Blog> Blog { get; set; }
        public DbSet<BlogCategory> Categorie { get; set; }
        public DbSet<PaymentHistory> PaymentHistory { get; set; }
        public DbSet<BookingDetail> BookingDetail { get; set; }
        public DbSet<Feedback> Feedback { get; set; }
        public Task<int> SaveChangesAsync();
    }
}
