using backend.Application.DTOs.ChatPromptDTO;
using backend.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeminiController : ControllerBase
    {
        private readonly IGeminiService _geminiService;

        public GeminiController(IGeminiService geminiService)
        {
            _geminiService = geminiService;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatPromptResponse dto)
        {
            var reply = await _geminiService.GenerateReplyAsync(dto.Prompt);
            return Ok(reply); 
        }
    }
}
