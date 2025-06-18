using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories
{
    public class FeedbackRepository : IFeedbackRepository
    {
        private readonly ApplicationDbContext _context;

        public FeedbackRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Feedback>> GetAllFeedbacksAsync()
        {
            return await _context.Feedback
                .Include(f => f.TestService)
                .Include(f => f.Account)
                .ToListAsync();
        }

        public async Task<Feedback?> GetFeedbackByIdAsync(Guid id)
        {
            return await _context.Feedback
                .Include(f => f.TestService)
                .Include(f => f.Account)
                .FirstOrDefaultAsync(f => f.FeedbackId == id);
        }

        public async Task<IEnumerable<Feedback>> GetFeedbacksByServiceIdAsync(Guid serviceId)
        {
            return await _context.Feedback
                .Include(f => f.TestService)
                .Include(f => f.Account)
                .Where(f => f.ServiceId == serviceId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Feedback>> GetFeedbacksByAccountIdAsync(Guid accountId)
        {
            return await _context.Feedback
                .Include(f => f.TestService)
                .Include(f => f.Account)
                .Where(f => f.AccountId == accountId)
                .ToListAsync();
        }

        public async Task<Feedback> CreateFeedbackAsync(Feedback feedback)
        {
            await _context.Feedback.AddAsync(feedback);
            await _context.SaveChangesAsync();
            return feedback;
        }

        public async Task<Feedback?> UpdateFeedbackAsync(Feedback feedback)
        {
            var existingFeedback = await _context.Feedback.FindAsync(feedback.FeedbackId);
            if (existingFeedback == null)
            {
                return null;
            }

            existingFeedback.Detail = feedback.Detail;
            existingFeedback.Rating = feedback.Rating;
            
            _context.Feedback.Update(existingFeedback);
            await _context.SaveChangesAsync();
            
            return existingFeedback;
        }

        public async Task<bool> DeleteFeedbackAsync(Guid id)
        {
            var feedback = await _context.Feedback.FindAsync(id);
            if (feedback == null)
            {
                return false;
            }

            _context.Feedback.Remove(feedback);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> FeedbackExistsAsync(Guid id)
        {
            return await _context.Feedback.AnyAsync(f => f.FeedbackId == id);
        }
    }
}
