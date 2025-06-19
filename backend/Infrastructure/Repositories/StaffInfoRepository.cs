using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories
{
    public class StaffInfoRepository : IStaffInfoRepository
    {
        private readonly ApplicationDbContext _context;

        public StaffInfoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<StaffInfo?> GetByIdAsync(Guid accountId)
        {
            return await _context.StaffInfo
                .Include(s => s.Account)
                .FirstOrDefaultAsync(s => s.AccountId == accountId);
        }

        public async Task<IEnumerable<StaffInfo>> GetAllAsync()
        {
            return await _context.StaffInfo
                .Include(s => s.Account)
                .ToListAsync();
        }

        public async Task<StaffInfo> CreateAsync(StaffInfo staffInfo)
        {
            staffInfo.CreateAt = DateTime.UtcNow;
            await _context.StaffInfo.AddAsync(staffInfo);
            await _context.SaveChangesAsync();
            return staffInfo;
        }

        public async Task<StaffInfo?> UpdateAsync(StaffInfo staffInfo)
        {
            var existingStaffInfo = await _context.StaffInfo.FindAsync(staffInfo.AccountId);
            if (existingStaffInfo == null)
            {
                return null;
            }

            existingStaffInfo.Department = staffInfo.Department;
            existingStaffInfo.Degree = staffInfo.Degree;
            existingStaffInfo.YearOfExperience = staffInfo.YearOfExperience;
            existingStaffInfo.Biography = staffInfo.Biography;
            existingStaffInfo.UpdateAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingStaffInfo;
        }

        public async Task<bool> DeleteAsync(Guid accountId)
        {
            var staffInfo = await _context.StaffInfo.FindAsync(accountId);
            if (staffInfo == null)
            {
                return false;
            }

            _context.StaffInfo.Remove(staffInfo);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(Guid accountId)
        {
            return await _context.StaffInfo.AnyAsync(s => s.AccountId == accountId);
        }
    }
}
