namespace backend.Application.DTOs.BlogDTO
{
    public class BlogResponse
    {
        public Guid BlogId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? Excerpt { get; set; }
        public string? AuthorName { get; set; }
        public string? CategoryName { get; set; }
        public string? FeaturedImageUrl { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
