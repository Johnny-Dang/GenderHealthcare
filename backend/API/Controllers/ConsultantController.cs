using backend.Application.DTOs.ConsultantDTO;
using backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/consultants")]
    // api lấy thông tin về consultant
    public class ConsultantController : ControllerBase
    {
        private readonly IConsultantService _consultantService;
        public ConsultantController(IConsultantService consultantService)
        {
            _consultantService = consultantService;
        }
        [HttpGet]
        public async Task<IActionResult> GetAllConsultants()
        {
            var result = await _consultantService.GetAllConsultantsAsync();
            if (result.IsSuccess)
                return Ok(result.Data);

            return BadRequest(result.Error);
        }


        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Consultant,Manager")]
        public async Task<IActionResult> GetConsultantById(Guid id)
        {
            var result = await _consultantService.GetConsultantByIdAsync(id);
            if (result.IsSuccess)
                return Ok(result.Data);

            return BadRequest(result.Error);
        }
    }
}
