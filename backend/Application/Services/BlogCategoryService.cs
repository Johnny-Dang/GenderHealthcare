using backend.Application.DTOs.CategoryDTO;
using backend.Application.Interfaces;
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
    }
}
