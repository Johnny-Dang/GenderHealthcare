using backend.Application.DTOs.TestServiceSlotDTO;

namespace backend.Application.Services
{
    public interface ITestServiceSlotService
    {
        Task<Result<TestServiceSlotResponse>> CreateSlotAsync(CreateTestServiceSlotRequest request);
        Task<Result<TestServiceSlotResponse>> GetSlotByIdAsync(Guid slotId);
        Task<Result<List<TestServiceSlotResponse>>> GetSlotsByServiceIdAsync(Guid serviceId);
        Task<Result<List<TestServiceSlotResponse>>> GetSlotsByServiceIdAndDateAsync(Guid serviceId, DateOnly date);
        Task<Result<TestServiceSlotResponse>> UpdateSlotAsync(Guid slotId, UpdateTestServiceSlotRequest request);
        Task<Result<bool>> DeleteSlotAsync(Guid slotId);

        Task<Result<bool>> HasAvailableCapacityAsync(Guid slotId);
        Task<Result<TestServiceSlotResponse>> FindOrCreateSlotAsync(Guid serviceId, DateOnly date, string shift);

        Task<Result<bool>> IncrementSlotQuantityAsync(Guid slotId);
        Task<Result<bool>> DecrementSlotQuantityAsync(Guid slotId);
    }
}
