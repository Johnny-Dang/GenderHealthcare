using backend.Application.DTOs.BlogDTO;
using backend.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlogController : ControllerBase
    {
        private readonly IBlogService _blogService;
        public BlogController(IBlogService blogService)
        {
            _blogService = blogService;
        }
        // GET: api/blog/published
        [HttpGet("published")]
        public async Task<IActionResult> GetPublishedBlogs()
        {
            var blogs = await _blogService.GetPublishedBlogsAsync();
            return Ok(blogs);
        }

        // GET: api/blog/{slug}
        [HttpGet("{slug}")]
        public async Task<IActionResult> GetBlogBySlug(string slug)
        {
            var blog = await _blogService.GetBlogBySlugAsync(slug);
            if (blog == null)
                return NotFound();
            return Ok(blog);
        }

        // POST: api/blog
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateBlog([FromBody] CreateBlogRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var blog = await _blogService.CreateBlogAsync(request);
            return CreatedAtAction(nameof(GetBlogBySlug), new { slug = blog.Slug }, blog);
        }

        // PUT: api/blog/{id}
        [HttpPut("{id}")]
        [Authorize]

        public async Task<IActionResult> UpdateBlog(Guid id, [FromBody] UpdateBlogRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var result = await _blogService.UpdateBlogAsync(id, request);
            if (!result)
                return NotFound();
            return NoContent();
        }

        // DELETE: api/blog/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteBlog(Guid id)
        {
            var result = await _blogService.DeleteBlogAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}
