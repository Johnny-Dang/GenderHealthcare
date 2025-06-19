using backend.Domain.Entities;

namespace backend.Application.Repositories
{
    public interface IBlogRepository
    {
        Task<IEnumerable<Blog>> GetPublishedBlogsAsync();
        Task<Blog?> GetBlogBySlugAsync(string slug);
        Task<Blog> CreateBlogAsync(Blog blog);
        Task<Blog?> GetBlogByIdAsync(Guid id);
        Task<bool> UpdateBlogAsync(Blog blog);
        Task<bool> DeleteBlogAsync(Guid id);
        Task<bool> SlugExistsAsync(string slug);
        Task<bool> SlugExistsExceptCurrentAsync(string slug, Guid blogId);
        Task<bool> AuthorExistsAsync(Guid authorId);
        Task<bool> CategoryExistsAsync(Guid categoryId);
    }
}
