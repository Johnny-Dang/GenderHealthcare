using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.BlogCategoryDTO
{
    public class CreateCategoryRequest
    {
        [Required(ErrorMessage = "Tên danh mục không được để trống.")]
        [MaxLength(100, ErrorMessage = "Tên danh mục không được vượt quá 100 ký tự.")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "Mô tả không được vượt quá 500 ký tự.")]
        public string? Description { get; set; }
    }
}
