using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly IApplicationDbContext _context;

        public RoleRepository(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Role>> GetAllAsync()
        {
            return await _context.Role.ToListAsync();
        }

        public async Task<Role?> GetByIdAsync(Guid id)
        {
            return await _context.Role.FindAsync(id);
        }

        public async Task<Role> CreateAsync(Role role)
        {
            _context.Role.Add(role);
            await _context.SaveChangesAsync();
            return role;
        }

        public async Task<bool> UpdateAsync(Role role)
        {
            _context.Role.Update(role);
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