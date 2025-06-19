using backend.Domain.Entities;

namespace backend.Application.Repositories
{
    public interface ITestServiceRepository
    {
        // Create
        Task<TestService> AddAsync(TestService testService);
        
        // Read
        Task<List<TestService>> GetAllAsync();
        Task<TestService> GetByIdAsync(Guid id);
        Task<List<TestService>> GetByCategoryAsync(string category);
        
        // Update
        Task<TestService> UpdateAsync(TestService testService);
        
        // Delete
        Task<bool> DeleteAsync(Guid id);
        
        // Additional methods
        Task<bool> ExistsAsync(Guid id);
        Task<int> CountAsync();
    }
}
