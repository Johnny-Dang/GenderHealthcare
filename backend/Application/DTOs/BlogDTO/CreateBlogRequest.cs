using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.BlogDTO
{
    public class CreateBlogRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? Excerpt { get; set; }
        public Guid AuthorId { get; set; }
        public Guid CategoryId { get; set; }
        public string? FeaturedImageUrl { get; set; }
        public bool IsPublished { get; set; } = false;
    }
}
