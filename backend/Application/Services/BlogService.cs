using Azure.Core;
using backend.Application.DTOs.BlogDTO;
using backend.Application.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Services
{
    public class BlogService : IBlogService
    {
        private readonly IApplicationDbContext _context;
        public BlogService(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<BlogResponse>> GetPublishedBlogsAsync()
        {
            return await _context.Blog
                .Include(b => b.Author)
                .Include(b => b.Category)
                .Where(b => b.IsPublished)
                .Select(b => new BlogResponse
                {
                    BlogId = b.BlogId,
                    Title = b.Title,
                    Slug = b.Slug,
                    Content = b.Content,
                    Excerpt = b.Excerpt,
                    AuthorName = (b.Author!.FirstName ?? "") + " " + (b.Author!.LastName ?? ""),
                    CategoryName = b.Category!.Name,
                    FeaturedImageUrl = b.FeaturedImageUrl,
                    IsPublished = b.IsPublished,
                    CreatedAt = b.CreatedAt,
                })
                .ToListAsync();
        }

        public async Task<BlogResponse?> GetBlogBySlugAsync(string slug)
        {
            var blog = await _context.Blog
                 .Include(b => b.Author)
                 .Include(b => b.Category)
                 .FirstOrDefaultAsync(b => b.Slug == slug && b.IsPublished);

            if (blog == null)
                return null;

            return new BlogResponse
            {
                BlogId = blog.BlogId,
                Title = blog.Title,
                Slug = blog.Slug,
                Content = blog.Content,
                Excerpt = blog.Excerpt,
                AuthorName = (blog.Author!.FirstName ?? "") + " " + (blog.Author!.LastName ?? ""),
                CategoryName = blog.Category!.Name,
                FeaturedImageUrl = blog.FeaturedImageUrl,
                IsPublished = blog.IsPublished,
                CreatedAt = blog.CreatedAt,
            };
        }

        public async Task<Blog> CreateBlogAsync(CreateBlogRequest request)
        {
            var author = await _context.Account.FirstOrDefaultAsync(user => user.AccountId == request.AuthorId);
            if (author == null)
                throw new ArgumentException("Invalid AuthorId");

            if (!await _context.Categorie.AnyAsync(c => c.CategoryId == request.CategoryId))
                throw new ArgumentException("Invalid CategoryId");

            // Tạo slug
            var slug = GenerateSlug(request.Title);
            int suffix = 1;
            var originalSlug = slug;
            while (await _context.Blog.AnyAsync(b => b.Slug == slug))
            {
                slug = $"{originalSlug}-{suffix}";
                suffix++;
            }

            var blog = new Blog
            {
                BlogId = Guid.NewGuid(),
                Title = request.Title,
                Slug = slug,
                Content = request.Content,
                Excerpt = request.Excerpt,
                AuthorId = request.AuthorId,
                CategoryId = request.CategoryId,
                FeaturedImageUrl = request.FeaturedImageUrl,
                IsPublished = request.IsPublished,
                CreatedAt = DateTime.UtcNow
            };

            _context.Blog.Add(blog);
            await _context.SaveChangesAsync();
            return blog;
        }

        public async Task<bool> UpdateBlogAsync(Guid id, UpdateBlogRequest request)
        {
            var blog = await _context.Blog.FindAsync(id);
            if (blog == null)
                return false;

            // Chỉ kiểm tra author tồn tại
            var author = await _context.Account.FirstOrDefaultAsync(user => user.AccountId == request.AuthorId);
            if (author == null)
                throw new ArgumentException("Invalid AuthorId");

            // Kiểm tra category tồn tại
            if (!await _context.Categorie.AnyAsync(c => c.CategoryId == request.CategoryId))
                throw new ArgumentException("Invalid CategoryId");

            // Tạo slug
            var slug = GenerateSlug(request.Title);
            int suffix = 1;
            var originalSlug = slug;
            while (await _context.Blog.AnyAsync(b => b.Slug == slug && b.BlogId != id))
            {
                slug = $"{originalSlug}-{suffix}";
                suffix++;
            }

            blog.Title = request.Title;
            blog.Slug = slug;
            blog.Content = request.Content;
            blog.Excerpt = request.Excerpt;
            blog.AuthorId = request.AuthorId;
            blog.CategoryId = request.CategoryId;
            blog.FeaturedImageUrl = request.FeaturedImageUrl;
            blog.IsPublished = request.IsPublished;

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

        // Helper method to generate a unique slug for the blog
        private string GenerateSlug(string title)
        {
            if (string.IsNullOrWhiteSpace(title))
                return "untitled";

            var slug = title.ToLower()
                .Replace("áàảãạ", "a")
                .Replace("éèẻẽẹ", "e")
                .Replace("íìỉĩị", "i")
                .Replace("óòỏõọ", "o")
                .Replace("úùủũụ", "u")
                .Replace("ýỳỷỹỵ", "y")
                .Replace("đ", "d")
                .Replace(" ", "-")
                .Replace(".", "")
                .Replace(",", "")
                .Replace(":", "")
                .Replace(";", "")
                .Replace("?", "")
                .Replace("!", "");

            while (slug.Contains("--"))
                slug = slug.Replace("--", "-");

            return slug.Trim('-');
        }
    }

}
