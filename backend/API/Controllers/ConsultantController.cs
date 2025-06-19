using backend.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ConsultantController : ControllerBase
    {
        private readonly IConsultantService _consultantService;
        public ConsultantController(IConsultantService consultantService)
        {
            _consultantService = consultantService;
        }
        [HttpGet("consultants")]
        public async Task<IActionResult> GetAllConsultants()
        {
            var result = await _consultantService.GetAllConsultantsAsync();
            if (result.IsSuccess)
                return Ok(result.Data);

            return BadRequest(result.Error);
        }

        [HttpGet("consultants/{id}")]
        public async Task<IActionResult> GetConsultantById(Guid id)
        {
            var result = await _consultantService.GetConsultantByIdAsync(id);
            if (result.IsSuccess)
                return Ok(result.Data);

            return BadRequest(result.Error);
        }
    }
}
