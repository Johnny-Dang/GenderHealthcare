using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories
{
    public class BlogCategoryRepository : IBlogCategoryRepository
    {
        private readonly IApplicationDbContext _context;

        public BlogCategoryRepository(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BlogCategory>> GetAllCategoriesAsync()
        {
            return await _context.BlogCategory.ToListAsync();
        }

        public async Task<BlogCategory> CreateCategoryAsync(BlogCategory category)
        {
            _context.BlogCategory.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<BlogCategory?> GetCategoryByIdAsync(Guid categoryId)
        {
            return await _context.BlogCategory.FindAsync(categoryId);
        }

        public async Task<bool> UpdateCategoryAsync(BlogCategory category)
        {
            _context.BlogCategory.Update(category);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCategoryAsync(Guid categoryId)
        {
            var category = await _context.BlogCategory.FindAsync(categoryId);
            if (category == null)
                return false;

            _context.BlogCategory.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
