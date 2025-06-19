using backend.Application.DTOs.BlogDTO;
using backend.Domain.Entities;

namespace backend.Application.Interfaces
{
    public interface IBlogService // Changed 'class' to 'interface'
    {
        Task<IEnumerable<BlogResponse>> GetPublishedBlogsAsync();
        Task<BlogResponse?> GetBlogBySlugAsync(string slug);
        Task<Blog> CreateBlogAsync(CreateBlogRequest request);
        Task<bool> UpdateBlogAsync(Guid id, UpdateBlogRequest request);
        Task<bool> DeleteBlogAsync(Guid id);
    }
}
