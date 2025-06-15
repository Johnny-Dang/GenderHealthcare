using AutoMapper;
using backend.Application.DTOs.Roles;
using backend.Application.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Services
{
    public class RoleService : IRoleService
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;

        public RoleService(IApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<RoleDto>> GetAllAsync()
        {
            var roles = await _context.Role.ToListAsync();
            return _mapper.Map<List<RoleDto>>(roles);
        }

        public async Task<RoleDto?> GetByIdAsync(Guid id)
        {
            var role = await _context.Role.FindAsync(id);
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

            _context.Role.Add(role);
            await _context.SaveChangesAsync();

            return _mapper.Map<RoleDto>(role);
        }

        public async Task<bool> UpdateAsync(UpdateRoleRequest request)
        {
            var role = await _context.Role.FindAsync(request.Id);
            if (role == null) return false;

            role.Name = request.Name;
            role.Description = request.Description;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var role = await _context.Role.FindAsync(id);
            if (role == null) return false;

            _context.Role.Remove(role);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
