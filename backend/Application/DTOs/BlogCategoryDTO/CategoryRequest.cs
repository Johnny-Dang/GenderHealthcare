using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.BlogCategoryDTO
{
    public class CategoryRequest
    {
        [Required(ErrorMessage = "CategoryId không được để trống.")]
        public Guid CategoryId { get; set; }

        [Required(ErrorMessage = "Tên danh mục không được để trống.")]
        [MaxLength(100, ErrorMessage = "Tên danh mục không được vượt quá 100 ký tự.")]
        public string Name { get; set; } = default!;
    }
}
