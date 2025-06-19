using backend.Application.DTOs.BlogDTO;
using backend.Application.Interfaces;
using backend.Application.Repositories;
using backend.Domain.Entities;

namespace backend.Infrastructure.Services
{
    public class BlogService : IBlogService
    {
        private readonly IBlogRepository _blogRepository;
        
        public BlogService(IBlogRepository blogRepository)
        {
            _blogRepository = blogRepository;
        }
        
        public async Task<IEnumerable<BlogResponse>> GetPublishedBlogsAsync()
        {
            var blogs = await _blogRepository.GetPublishedBlogsAsync();
            
            return blogs.Select(b => new BlogResponse
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
            });
        }

        public async Task<BlogResponse?> GetBlogBySlugAsync(string slug)
        {
            var blog = await _blogRepository.GetBlogBySlugAsync(slug);

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
            if (!await _blogRepository.AuthorExistsAsync(request.AuthorId))
                throw new ArgumentException("Invalid AuthorId");

            if (!await _blogRepository.CategoryExistsAsync(request.CategoryId))
                throw new ArgumentException("Invalid CategoryId");

            // Generate slug
            var slug = GenerateSlug(request.Title);
            int suffix = 1;
            var originalSlug = slug;
            while (await _blogRepository.SlugExistsAsync(slug))
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

            return await _blogRepository.CreateBlogAsync(blog);
        }

        public async Task<bool> UpdateBlogAsync(Guid id, UpdateBlogRequest request)
        {
            var blog = await _blogRepository.GetBlogByIdAsync(id);
            if (blog == null)
                return false;

            if (!await _blogRepository.AuthorExistsAsync(request.AuthorId))
                throw new ArgumentException("Invalid AuthorId");

            if (!await _blogRepository.CategoryExistsAsync(request.CategoryId))
                throw new ArgumentException("Invalid CategoryId");

            // Generate slug
            var slug = GenerateSlug(request.Title);
            int suffix = 1;
            var originalSlug = slug;
            while (await _blogRepository.SlugExistsExceptCurrentAsync(slug, id))
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

            return await _blogRepository.UpdateBlogAsync(blog);
        }

        public async Task<bool> DeleteBlogAsync(Guid id)
        {
            return await _blogRepository.DeleteBlogAsync(id);
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
