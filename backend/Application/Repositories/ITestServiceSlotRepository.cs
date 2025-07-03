using backend.Domain.Entities;

namespace backend.Application.Repositories
{
    public interface ITestServiceSlotRepository
    {
        // Create
        Task<TestServiceSlot> CreateAsync(TestServiceSlot slot);

        // Read
        Task<TestServiceSlot> GetByIdAsync(Guid slotId);
        Task<List<TestServiceSlot>> GetByServiceIdAsync(Guid serviceId);
        Task<List<TestServiceSlot>> GetByServiceIdAndDateAsync(Guid serviceId, DateOnly date);
        Task<List<TestServiceSlot>> GetAllAsync();

        // Update
        Task<TestServiceSlot> UpdateAsync(TestServiceSlot slot);
        Task<bool> IncrementCurrentQuantityAsync(Guid slotId);
        Task<bool> DecrementCurrentQuantityAsync(Guid slotId);

        // Delete
        Task<bool> DeleteAsync(Guid slotId);

        // Additional
        Task<bool> ExistsAsync(Guid slotId);
        Task<bool> HasAvailableCapacityAsync(Guid slotId);
        Task<bool> IsSlotForServiceAsync(Guid slotId, Guid serviceId);

        // Find or create
        Task<TestServiceSlot> FindOrCreateSlotAsync(Guid serviceId, DateOnly date, string shift);

        Task GenerateSlotsForUpcomingWeeksAsync(Guid serviceId, int numberOfWeeks = 2, int maxQuantity = 10);
    }
}

