using backend.Application.DTOs.ConsultantDTO;
using backend.Application.Services;
using backend.Application.Repositories;

namespace backend.Infrastructure.Services
{
    public class ConsultantService : IConsultantService
    {
        private readonly IConsultantRepository _consultantRepository;

        public ConsultantService(IConsultantRepository consultantRepository)
        {
            _consultantRepository = consultantRepository;
        }

        public async Task<Result<List<ConsultantResponse>>> GetAllConsultantsAsync()
        {
            var consultants = await _consultantRepository.GetAllConsultantsAsync();
            return Result<List<ConsultantResponse>>.Success(consultants);
        }

        public async Task<Result<ConsultantResponse>> GetConsultantByIdAsync(Guid consultantId)
        {
            var consultant = await _consultantRepository.GetConsultantByIdAsync(consultantId);

            if (consultant == null)
            {
                return Result<ConsultantResponse>.Failure("Consultant not found");
            }

            return Result<ConsultantResponse>.Success(consultant);
        }

        public async Task<Result<ConsultantResponse>> UpdateConsultantByIdAsync(Guid consultantId, ConsultantUpdateRequest request)
        {
            var consultant = await _consultantRepository.GetConsultantEntityByIdAsync(consultantId);

            if (consultant == null)
            {
                return Result<ConsultantResponse>.Failure("Consultant not found");
            }

            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                var names = request.FullName.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                consultant.FirstName = names.Length > 0 ? names[0] : consultant.FirstName;
                consultant.LastName = names.Length > 1 ? names[1] : consultant.LastName;
            }

            if (!string.IsNullOrWhiteSpace(request.Phone))
                consultant.Phone = request.Phone;

            if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
                consultant.AvatarUrl = request.AvatarUrl;


            if (consultant.StaffInfo != null)
            {
                if (!string.IsNullOrWhiteSpace(request.Department))
                    consultant.StaffInfo.Department = request.Department;

                if (!string.IsNullOrWhiteSpace(request.Degree))
                    consultant.StaffInfo.Degree = request.Degree;

                if (request.YearOfExperience.HasValue)
                    consultant.StaffInfo.YearOfExperience = request.YearOfExperience.Value;

                if (!string.IsNullOrWhiteSpace(request.Biography))
                    consultant.StaffInfo.Biography = request.Biography;

                consultant.StaffInfo.UpdateAt = DateTime.UtcNow;
            }

            consultant.UpdateAt = DateTime.UtcNow;


            await _consultantRepository.SaveChangesAsync();
            return Result<ConsultantResponse>.Success(new ConsultantResponse
            {
                Id = consultant.AccountId,
                FullName = $"{consultant.FirstName} {consultant.LastName}".Trim(),
                Email = consultant.Email,
                Phone = consultant.Phone,
                AvatarUrl = consultant.AvatarUrl,
                Department = consultant.StaffInfo?.Department,
                Degree = consultant.StaffInfo?.Degree,
                YearOfExperience = consultant.StaffInfo?.YearOfExperience ?? 0,
                Biography = consultant.StaffInfo?.Biography
            });

        }
    }
}
