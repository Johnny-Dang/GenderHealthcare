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
    }
}
