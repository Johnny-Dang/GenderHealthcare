using backend.Application.DTOs.ServiceDTO;
using backend.Application.Interfaces;
using backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/services")]
    public class TestServiceController : ControllerBase
    {
        private readonly ITestServiceService _service;

        public TestServiceController(ITestServiceService service)
        {
            _service = service;
        }

        // POST: api/services
        [HttpPost]
        [Authorize(Roles = "Staff,Manager")]
        public async Task<IActionResult> Create([FromBody] CreateTestServiceRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
                
            var service = await _service.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = service.ServiceId }, service);
        }

        // GET: api/services
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var services = await _service.GetAllAsync();
            return Ok(services);
        }

        // GET: api/services/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var service = await _service.GetByIdAsync(id);
            if (service == null)
                return NotFound();

            return Ok(service);
        }

        // GET: api/services/category/{category}
        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetByCategory(string category)
        {
            var services = await _service.GetByCategoryAsync(category);
            return Ok(services);
        }

        // PUT: api/services/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Staff,Manager")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTestServiceRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedService = await _service.UpdateAsync(id, request);
            if (updatedService == null)
                return NotFound();

            return Ok(updatedService);
        }

        // DELETE: api/services/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Staff,Manager")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }

        // GET: api/services/all-admin
        [HttpGet("all-admin")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var services = await _service.GetAllForAdminAsync();
            return Ok(services);
        }
    }
}
