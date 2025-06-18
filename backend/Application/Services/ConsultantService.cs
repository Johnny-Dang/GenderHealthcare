using backend.Application.DTOs.ConsultantDTO;
using backend.Application.Interfaces;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Services
{
    public class ConsultantService : IConsultantService
    {
        private readonly IApplicationDbContext _context;
        public ConsultantService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<ConsultantResponse>>> GetAllConsultantsAsync()
        {
            var consultants = await _context.Accounts
            .Include(a => a.Role)
            .Include(a => a.StaffInfo)
            .Where(a => a.Role.Name == "Consultant")
            .Select(a => new ConsultantResponse
            {
                Id = a.User_Id,
                FullName = $"{a.FirstName} {a.LastName}".Trim(),
                Email = a.Email,
                Phone = a.Phone,
                AvatarUrl = a.avatarUrl,
                Department = a.StaffInfo != null ? a.StaffInfo.DepartmentId : null,
                Degree = a.StaffInfo != null ? a.StaffInfo.Degree : null,
                YearOfExperience = a.StaffInfo != null ? a.StaffInfo.YearOfExperience : 0,
                Biography = a.StaffInfo != null ? a.StaffInfo.Biography : null
            })
            .ToListAsync();
            return Result<List<ConsultantResponse>>.Success(consultants);
        }

        public async Task<Result<ConsultantResponse>> GetConsultantByIdAsync(Guid consultantId)
        {
            var consultant = await _context.Accounts
            .Include(a => a.StaffInfo)
            .Where(a => a.User_Id == consultantId)
            .Select(a => new ConsultantResponse
            {
                Id = a.User_Id,
                FullName = $"{a.FirstName} {a.LastName}".Trim(),
                Email = a.Email,
                Phone = a.Phone,
                AvatarUrl = a.avatarUrl,
                Department = a.StaffInfo != null ? a.StaffInfo.DepartmentId : null,
                Degree = a.StaffInfo != null ? a.StaffInfo.Degree : null,
                YearOfExperience = a.StaffInfo != null ? a.StaffInfo.YearOfExperience : 0,
                Biography = a.StaffInfo != null ? a.StaffInfo.Biography : null
            })
            .FirstOrDefaultAsync();

            if (consultant == null)
            {
                return Result<ConsultantResponse>.Failure("Consultant not found");
            }

            return Result<ConsultantResponse>.Success(consultant);
        }
    }
}
