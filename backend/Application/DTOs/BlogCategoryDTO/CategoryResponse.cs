namespace backend.Application.DTOs.CategoryDTO
{
    public class CategoryResponse
    {
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = default!;
    }
}
