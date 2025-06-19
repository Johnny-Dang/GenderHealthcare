using backend.Domain.Entities;

namespace backend.Application.Repositories
{
    public interface IBlogCategoryRepository
    {
        Task<IEnumerable<BlogCategory>> GetAllCategoriesAsync();
        Task<BlogCategory> CreateCategoryAsync(BlogCategory category);
        Task<BlogCategory?> GetCategoryByIdAsync(Guid categoryId);
        Task<bool> UpdateCategoryAsync(BlogCategory category);
        Task<bool> DeleteCategoryAsync(Guid categoryId);
    }
}
