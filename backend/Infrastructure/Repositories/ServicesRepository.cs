using backend.Application.Interfaces;
using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace backend.Infrastructure.Repositories
{
    public class ServicesRepository : IServicesServiceRepository
    {
        private readonly IApplicationDbContext _context;
        private readonly IServicesServiceRepository _testServiceRepository;
        public ServicesRepository(IApplicationDbContext context)
        {
            _context = context;
        }

        // Create
        public async Task<Service> AddAsync(Service testService)
        {
            testService.ServiceId = Guid.NewGuid();
            testService.CreatedAt = DateTime.UtcNow;
            _context.Service.Add(testService);
            await _context.SaveChangesAsync();
            return testService;
        }

        // Read
        public async Task<List<Service>> GetAllAsync()
        {
            return await _context.Service.ToListAsync();
        }

        public async Task<Service> GetByIdAsync(Guid id)
        {
            return await _context.Service.FindAsync(id);
        }

        public async Task<List<Service>> GetByCategoryAsync(string category)
        {
            return await _context.Service
                .Where(s => s.Category == category)
                .ToListAsync();
        }

        // Update
        public async Task<Service> UpdateAsync(Service testService)
        {
            var existingService = await _context.Service.FindAsync(testService.ServiceId);
            
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
            var service = await _context.Service.FindAsync(id);
            
            if (service == null)
                return false;

            _context.Service.Remove(service);
            await _context.SaveChangesAsync();
            
            return true;
        }

        // Additional methods
        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Service.AnyAsync(s => s.ServiceId == id);
        }

        public async Task<int> CountAsync()
        {
            return await _context.Service.CountAsync();
        }
    }
}
