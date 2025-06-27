using backend.Application.DTOs.ConsultantDTO;
using DeployGenderSystem.Domain.Entity;

namespace backend.Application.Repositories
{
    public interface IConsultantRepository
    {
        Task<List<ConsultantResponse>> GetAllConsultantsAsync();
        Task<ConsultantResponse?> GetConsultantByIdAsync(Guid consultantId);

        Task<Account?> GetConsultantEntityByIdAsync(Guid accountId);
        Task SaveChangesAsync();
    }
}
