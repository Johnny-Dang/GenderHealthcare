using backend.Application.DTOs.FeedbackDTO;

namespace backend.Application.Services
{
    public interface IFeedbackService
    {
        Task<IEnumerable<FeedbackDTO>> GetAllFeedbacksAsync();
        Task<FeedbackDTO?> GetFeedbackByIdAsync(Guid id);
        Task<IEnumerable<FeedbackDTO>> GetFeedbacksByServiceIdAsync(Guid serviceId);
        Task<IEnumerable<FeedbackDTO>> GetFeedbacksByAccountIdAsync(Guid accountId);
        Task<FeedbackDTO> CreateFeedbackAsync(CreateFeedbackDTO createFeedbackDTO);
        Task<FeedbackDTO?> UpdateFeedbackAsync(UpdateFeedbackDTO updateFeedbackDTO);
        Task<bool> DeleteFeedbackAsync(Guid id);
    }
}
