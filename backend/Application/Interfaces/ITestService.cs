using backend.Application.DTOs.ServiceDTO;

namespace backend.Application.Interfaces
{
    public interface ITestService
    {
        Task<IEnumerable<TestServiceResponse>> GetAllAsync();
        Task<TestServiceResponse> GetByIdAsync(Guid id);
        Task<CreateTestServiceRequest> CreateAsync(CreateTestServiceRequest testDto);
        Task<bool> UpdateAsync(Guid id, UpdateTestServiceRequest testDto);
        Task<bool> DeleteAsync(Guid id);
    }
}
