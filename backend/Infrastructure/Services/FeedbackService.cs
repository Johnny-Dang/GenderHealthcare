using backend.Application.DTOs.FeedbackDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Entities;

namespace backend.Infrastructure.Services
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IFeedbackRepository _feedbackRepository;

        public FeedbackService(IFeedbackRepository feedbackRepository)
        {
            _feedbackRepository = feedbackRepository;
        }

        public async Task<IEnumerable<FeedbackDTO>> GetAllFeedbacksAsync()
        {
            var feedbacks = await _feedbackRepository.GetAllFeedbacksAsync();
            return feedbacks.Select(MapToDTO);
        }

        public async Task<FeedbackDTO?> GetFeedbackByIdAsync(Guid id)
        {
            var feedback = await _feedbackRepository.GetFeedbackByIdAsync(id);
            return feedback != null ? MapToDTO(feedback) : null;
        }

        public async Task<IEnumerable<FeedbackDTO>> GetFeedbacksByServiceIdAsync(Guid serviceId)
        {
            var feedbacks = await _feedbackRepository.GetFeedbacksByServiceIdAsync(serviceId);
            return feedbacks.Select(MapToDTO);
        }

        public async Task<IEnumerable<FeedbackDTO>> GetFeedbacksByAccountIdAsync(Guid accountId)
        {
            var feedbacks = await _feedbackRepository.GetFeedbacksByAccountIdAsync(accountId);
            return feedbacks.Select(MapToDTO);
        }

        public async Task<FeedbackDTO> CreateFeedbackAsync(CreateFeedbackDTO createFeedbackDTO)
        {
            var feedback = new Feedback
            {
                FeedbackId = Guid.NewGuid(),
                ServiceId = createFeedbackDTO.ServiceId,
                AccountId = createFeedbackDTO.AccountId,
                Detail = createFeedbackDTO.Detail,
                Rating = createFeedbackDTO.Rating,
                CreatedAt = DateTime.UtcNow
            };

            var createdFeedback = await _feedbackRepository.CreateFeedbackAsync(feedback);
            return MapToDTO(createdFeedback);
        }

        public async Task<FeedbackDTO?> UpdateFeedbackAsync(UpdateFeedbackDTO updateFeedbackDTO)
        {
            var exists = await _feedbackRepository.FeedbackExistsAsync(updateFeedbackDTO.FeedbackId);
            if (!exists)
            {
                return null;
            }

            var feedback = new Feedback
            {
                FeedbackId = updateFeedbackDTO.FeedbackId,
                Detail = updateFeedbackDTO.Detail,
                Rating = updateFeedbackDTO.Rating
            };

            var updatedFeedback = await _feedbackRepository.UpdateFeedbackAsync(feedback);
            return updatedFeedback != null ? MapToDTO(updatedFeedback) : null;
        }

        public async Task<bool> DeleteFeedbackAsync(Guid id)
        {
            return await _feedbackRepository.DeleteFeedbackAsync(id);
        }

        private static FeedbackDTO MapToDTO(Feedback feedback)
        {
            return new FeedbackDTO
            {
                FeedbackId = feedback.FeedbackId,
                ServiceId = feedback.ServiceId,
                AccountId = feedback.AccountId,
                Detail = feedback.Detail,
                Rating = feedback.Rating,
                CreatedAt = feedback.CreatedAt,
                ServiceName = feedback.TestService?.ServiceName ?? string.Empty,
                AccountName = feedback.Account?.FirstName + feedback.Account?.LastName ?? string.Empty
            };
        }
    }
}