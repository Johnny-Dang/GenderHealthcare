using backend.Application.DTOs.ConsultantDTO;

namespace backend.Application.Services
{
    public interface IConsultantService
    {
        Task<Result<List<ConsultantResponse>>> GetAllConsultantsAsync();
        Task<Result<ConsultantResponse>> GetConsultantByIdAsync(Guid consultantId);
    }
}
