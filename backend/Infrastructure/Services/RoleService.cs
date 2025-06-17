using AutoMapper;
using backend.Application.DTOs.Roles;
using backend.Application.Interfaces;
using backend.Application.Repositories;
using backend.Domain.Entities;

namespace backend.Infrastructure.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IMapper _mapper;

        public RoleService(IRoleRepository roleRepository, IMapper mapper)
        {
            _roleRepository = roleRepository;
            _mapper = mapper;
        }

        public async Task<List<RoleDto>> GetAllAsync()
        {
            var roles = await _roleRepository.GetAllAsync();
            return _mapper.Map<List<RoleDto>>(roles);
        }

        public async Task<RoleDto?> GetByIdAsync(Guid id)
        {
            var role = await _roleRepository.GetByIdAsync(id);
            return role == null ? null : _mapper.Map<RoleDto>(role);
        }

        public async Task<RoleDto> CreateAsync(CreateRoleRequest request)
        {
            var role = new Role
            {
                RoleId = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description
            };

            await _roleRepository.CreateAsync(role);
            return _mapper.Map<RoleDto>(role);
        }

        public async Task<bool> UpdateAsync(UpdateRoleRequest request)
        {
            var role = await _roleRepository.GetByIdAsync(request.Id);
            if (role == null) return false;

            role.Name = request.Name;
            role.Description = request.Description;

            return await _roleRepository.UpdateAsync(role);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _roleRepository.DeleteAsync(id);
        }
    }
}
