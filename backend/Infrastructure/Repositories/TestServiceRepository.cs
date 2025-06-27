using backend.Application.Interfaces;
using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace backend.Infrastructure.Repositories
{
    public class TestServiceRepository : ITestServiceRepository
    {
        private readonly IApplicationDbContext _context;
        public TestServiceRepository(IApplicationDbContext context)
        {
            _context = context;
        }

        // Create
        public async Task<TestService> AddAsync(TestService testService)
        {
            testService.ServiceId = Guid.NewGuid();
            testService.CreatedAt = DateTime.UtcNow;
            _context.TestService.Add(testService);
            await _context.SaveChangesAsync();
            return testService;
        }

        // Read
        public async Task<List<TestService>> GetAllAsync()
        {
            return await _context.TestService.Where(x => x.IsDeleted != true).ToListAsync();
        }

        public async Task<TestService> GetByIdAsync(Guid id)
        {
            return await _context.TestService.FindAsync(id);
        }

        public async Task<List<TestService>> GetByCategoryAsync(string category)
        {
            return await _context.TestService
                .Where(s => s.Category == category && s.IsDeleted == false)
                .ToListAsync();
        }

        // Update
        public async Task<TestService> UpdateAsync(TestService testService)
        {
            var existingService = await _context.TestService.FindAsync(testService.ServiceId);
            
            if (existingService == null)
                return null;

            // Update properties
            existingService.ServiceName = testService.ServiceName;
            existingService.Description = testService.Description;
            existingService.Price = testService.Price;
            existingService.ImageUrl = testService.ImageUrl;
            existingService.Category = testService.Category;
            existingService.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingService;
        }

        // Delete
        public async Task<bool> DeleteAsync(Guid id)
        {
            var service = await _context.TestService.FindAsync(id);
            
            if (service == null)
                return false;

            service.IsDeleted = true;
            await _context.SaveChangesAsync();
            
            return true;
        }

        // Additional methods
        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.TestService.AnyAsync(s => s.ServiceId == id);
        }
    }
}
