using backend.Domain.Entities;

namespace backend.Application.Repositories
{
    public interface IStaffInfoRepository
    {
        Task<StaffInfo?> GetByIdAsync(Guid accountId);
        Task<IEnumerable<StaffInfo>> GetAllAsync();
        Task<StaffInfo> CreateAsync(StaffInfo staffInfo);
        Task<StaffInfo?> UpdateAsync(StaffInfo staffInfo);
        Task<bool> DeleteAsync(Guid accountId);
        Task<bool> ExistsAsync(Guid accountId);
    }
}
