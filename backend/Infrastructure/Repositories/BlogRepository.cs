using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories
{
    public class BlogRepository : IBlogRepository
    {
        private readonly IApplicationDbContext _context;

        public BlogRepository(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Blog>> GetPublishedBlogsAsync()
        {
            return await _context.Blog
                .Include(b => b.Author)
                .Include(b => b.Category)
                .Where(b => b.IsPublished)
                .ToListAsync();
        }

        public async Task<Blog?> GetBlogBySlugAsync(string slug)
        {
            return await _context.Blog
                .Include(b => b.Author)
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Slug == slug && b.IsPublished);
        }

        public async Task<Blog> CreateBlogAsync(Blog blog)
        {
            _context.Blog.Add(blog);
            await _context.SaveChangesAsync();
            return blog;
        }

        public async Task<Blog?> GetBlogByIdAsync(Guid id)
        {
            return await _context.Blog.FindAsync(id);
        }

        public async Task<bool> UpdateBlogAsync(Blog blog)
        {
            _context.Blog.Update(blog);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteBlogAsync(Guid id)
        {
            var blog = await _context.Blog.FindAsync(id);
            if (blog == null)
                return false;

            _context.Blog.Remove(blog);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SlugExistsAsync(string slug)
        {
            return await _context.Blog.AnyAsync(b => b.Slug == slug);
        }

        public async Task<bool> SlugExistsExceptCurrentAsync(string slug, Guid blogId)
        {
            return await _context.Blog.AnyAsync(b => b.Slug == slug && b.BlogId != blogId);
        }

        public async Task<bool> AuthorExistsAsync(Guid authorId)
        {
            return await _context.Account.AnyAsync(user => user.AccountId == authorId);
        }

        public async Task<bool> CategoryExistsAsync(Guid categoryId)
        {
            return await _context.Categorie.AnyAsync(c => c.CategoryId == categoryId);
        }
    }
}
