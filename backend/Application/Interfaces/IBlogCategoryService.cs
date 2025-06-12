using backend.Application.DTOs.BlogCategoryDTO;
using backend.Application.DTOs.CategoryDTO;

namespace backend.Application.Interfaces
{
    public interface IBlogCategoryService
    {
        Task<IEnumerable<CategoryResponse>> GetAllCategoriesAsync();
    }
}
