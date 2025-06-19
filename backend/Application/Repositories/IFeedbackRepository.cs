using backend.Domain.Entities;

namespace backend.Application.Repositories
{
    public interface IFeedbackRepository
    {
        Task<IEnumerable<Feedback>> GetAllFeedbacksAsync();
        Task<Feedback?> GetFeedbackByIdAsync(Guid id);
        Task<IEnumerable<Feedback>> GetFeedbacksByServiceIdAsync(Guid serviceId);
        Task<IEnumerable<Feedback>> GetFeedbacksByAccountIdAsync(Guid accountId);
        Task<Feedback> CreateFeedbackAsync(Feedback feedback);
        Task<Feedback?> UpdateFeedbackAsync(Feedback feedback);
        Task<bool> DeleteFeedbackAsync(Guid id);
        Task<bool> FeedbackExistsAsync(Guid id);
    }
}
