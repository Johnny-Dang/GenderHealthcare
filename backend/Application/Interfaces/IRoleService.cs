using backend.Application.DTOs.Roles;

namespace backend.Application.Interfaces
{
    public interface IRoleService
    {
        public Task<List<RoleDto>> GetAllAsync();
        public Task<RoleDto?> GetByIdAsync(Guid id);
        public Task<RoleDto> CreateAsync(CreateRoleRequest request);
        public Task<bool> UpdateAsync(UpdateRoleRequest request);
        public Task<bool> DeleteAsync(Guid id);
    }
}
