using backend.Application.DTOs.BlogCategoryDTO;
using backend.Application.DTOs.CategoryDTO;

namespace backend.Application.Interfaces
{
    public interface IBlogCategoryService
    {
        Task<IEnumerable<CategoryResponse>> GetAllCategoriesAsync();
        Task<CategoryResponse> CreateCategoryAsync(CreateCategoryRequest request);
        Task<CategoryResponse?> UpdateCategoryAsync(Guid categoryId, UpdateCategoryRequest request);
        Task<bool> DeleteCategoryAsync(Guid categoryId);
    }
}
