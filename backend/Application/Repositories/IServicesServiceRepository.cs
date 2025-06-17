using backend.Domain.Entities;

namespace backend.Application.Repositories
{
    public interface IServicesServiceRepository
    {
        // Create
        Task<Service> AddAsync(Service testService);
        
        // Read
        Task<List<Service>> GetAllAsync();
        Task<Service> GetByIdAsync(Guid id);
        Task<List<Service>> GetByCategoryAsync(string category);
        
        // Update
        Task<Service> UpdateAsync(Service testService);
        
        // Delete
        Task<bool> DeleteAsync(Guid id);
        
        // Additional methods
        Task<bool> ExistsAsync(Guid id);
        Task<int> CountAsync();
    }
}
