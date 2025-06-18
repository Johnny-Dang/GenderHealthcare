using backend.Application.DTOs.ConsultantDTO;

namespace backend.Application.Interfaces
{
    public interface IConsultantService
    {
        Task<Result<List<ConsultantResponse>>> GetAllConsultantsAsync();
        Task<Result<ConsultantResponse>> GetConsultantByIdAsync(Guid consultantId);
    }
}
