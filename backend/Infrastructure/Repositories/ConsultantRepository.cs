using backend.Application.DTOs.ConsultantDTO;
using backend.Application.Repositories;
using backend.Infrastructure.Database;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories
{
    public class ConsultantRepository : IConsultantRepository
    {
        private readonly IApplicationDbContext _context;

        public ConsultantRepository(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ConsultantResponse>> GetAllConsultantsAsync()
        {
            return await _context.Account
                .Include(a => a.Role)
                .Include(a => a.StaffInfo)
                .Where(a => a.Role.Name == "Consultant")
                .Select(a => new ConsultantResponse
                {
                    Id = a.AccountId,
                    FullName = $"{a.FirstName} {a.LastName}".Trim(),
                    Email = a.Email,
                    Phone = a.Phone,
                    AvatarUrl = a.avatarUrl,
                    Department = a.StaffInfo != null ? a.StaffInfo.Department : null,
                    Degree = a.StaffInfo != null ? a.StaffInfo.Degree : null,
                    YearOfExperience = a.StaffInfo != null ? a.StaffInfo.YearOfExperience : 0,
                    Biography = a.StaffInfo != null ? a.StaffInfo.Biography : null
                })
                .ToListAsync();
        }

        public async Task<ConsultantResponse?> GetConsultantByIdAsync(Guid consultantId)
        {
            return await _context.Account
                .Include(a => a.StaffInfo)
                .Where(a => a.AccountId == consultantId)
                .Select(a => new ConsultantResponse
                {
                    Id = a.AccountId,
                    FullName = $"{a.FirstName} {a.LastName}".Trim(),
                    Email = a.Email,
                    Phone = a.Phone,
                    AvatarUrl = a.avatarUrl,
                    Department = a.StaffInfo != null ? a.StaffInfo.Department : null,
                    Degree = a.StaffInfo != null ? a.StaffInfo.Degree : null,
                    YearOfExperience = a.StaffInfo != null ? a.StaffInfo.YearOfExperience : 0,
                    Biography = a.StaffInfo != null ? a.StaffInfo.Biography : null
                })
                .FirstOrDefaultAsync();
        }

        // do trên leader chia ko đúng kiến trúc nên sai chấp nhận
        public async Task<Account?> GetConsultantEntityByIdAsync(Guid accountId)
        {
            return await _context.Account
                .Include(a => a.StaffInfo)
                .FirstOrDefaultAsync(a => a.AccountId == accountId);
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
