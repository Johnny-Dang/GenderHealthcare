 using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class Blog
    {
        public Guid BlogId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? Excerpt { get; set; } // giống mô tả ngắn
        public Guid AuthorId { get; set; }
        public Guid CategoryId { get; set; }
        public string? FeaturedImageUrl { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public BlogCategory? Category { get; set; }
        public Account? Author { get; set; }

    }
}
