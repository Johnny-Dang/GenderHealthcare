using backend.Application.DTOs.BlogCategoryDTO;
using backend.Application.DTOs.CategoryDTO;
using backend.Application.Interfaces;
using backend.Application.Repositories;
using backend.Domain.Entities;

namespace backend.Infrastructure.Services
{
    public class BlogCategoryService : IBlogCategoryService
    {
        private readonly IBlogCategoryRepository _categoryRepository;

        public BlogCategoryService(IBlogCategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<IEnumerable<CategoryResponse>> GetAllCategoriesAsync()
        {
            var categories = await _categoryRepository.GetAllCategoriesAsync();
            
            return categories.Select(c => new CategoryResponse
            {
                CategoryId = c.CategoryId,
                Name = c.Name
            });
        }

        public async Task<CategoryResponse> CreateCategoryAsync(CreateCategoryRequest request)
        {
            var category = new BlogCategory
            {
                CategoryId = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow
            };

            await _categoryRepository.CreateCategoryAsync(category);

            return new CategoryResponse
            {
                CategoryId = category.CategoryId,
                Name = category.Name
            };
        }

        public async Task<bool> DeleteCategoryAsync(Guid categoryId)
        {
            return await _categoryRepository.DeleteCategoryAsync(categoryId);
        }

        public async Task<CategoryResponse?> UpdateCategoryAsync(Guid categoryId, UpdateCategoryRequest request)
        {
            var category = await _categoryRepository.GetCategoryByIdAsync(categoryId);
            if (category == null)
                return null;

            category.Name = request.Name;
            category.Description = request.Description;
            
            await _categoryRepository.UpdateCategoryAsync(category);

            return new CategoryResponse
            {
                CategoryId = category.CategoryId,
                Name = category.Name
            };
        }
    }
}
