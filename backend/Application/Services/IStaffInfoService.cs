using backend.Application.DTOs.StaffInfoDTO;

namespace backend.Application.Services
{
    public interface IStaffInfoService
    {
        Task<StaffInfoDto?> GetByIdAsync(Guid accountId);
        Task<IEnumerable<StaffInfoDto>> GetAllAsync();
        Task<StaffInfoDto> CreateAsync(CreateStaffInfoRequest request);
        Task<StaffInfoDto?> UpdateAsync(Guid accountId, UpdateStaffInfoRequest request);
        Task<bool> DeleteAsync(Guid accountId);
    }
}
