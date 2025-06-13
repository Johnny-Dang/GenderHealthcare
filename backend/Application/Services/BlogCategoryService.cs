using backend.Application.DTOs.BlogCategoryDTO;
using backend.Application.DTOs.CategoryDTO;
using backend.Application.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Services
{
    public class BlogCategoryService : IBlogCategoryService
    {
        private readonly IApplicationDbContext _context;


        public BlogCategoryService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CategoryResponse>> GetAllCategoriesAsync()
        {
            return await _context.Categories
                .Select(c => new CategoryResponse
                {
                    CategoryId = c.CategoryId,
                    Name = c.Name
                })
                .ToListAsync();
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

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return new CategoryResponse
            {
                CategoryId = category.CategoryId,
                Name = category.Name
            };
        }

        public async Task<bool> DeleteCategoryAsync(Guid categoryId)
        {
            var category = await _context.Categories.FindAsync(categoryId);
            if (category == null)
                return false;

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }



        public async Task<CategoryResponse?> UpdateCategoryAsync(Guid categoryId, UpdateCategoryRequest request)
        {
            var category = await _context.Categories.FindAsync(categoryId);
            if (category == null)
                return null;

            category.Name = request.Name;
            category.Description = request.Description;
            await _context.SaveChangesAsync();

            return new CategoryResponse
            {
                CategoryId = category.CategoryId,
                Name = category.Name
            };
        }
    }
}
