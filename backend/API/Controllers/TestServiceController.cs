using backend.Application.DTOs.ServiceDTO;
using backend.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/service")]
    public class TestServiceController : ControllerBase
    {
        private readonly ITestService _service;
        public TestServiceController(ITestService service)
        {
            _service = service;
        }
        // GET: api/service
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var services = await _service.GetAllAsync();
            return Ok(services);
        }

        // GET: api/service/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var service = await _service.GetByIdAsync(id);
            if (service == null)
                return NotFound();
            return Ok(service);
        }


        // POST: api/service
        [HttpPost]
        [Authorize(Roles = "Staff,Manager")]

        public async Task<IActionResult> Create([FromBody] CreateTestServiceRequest serviceRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateAsync(serviceRequest);
            return Ok(created);
        }

        // PUT: api/service/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Staff,Manager")]

        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTestServiceRequest serviceRequest)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _service.UpdateAsync(id, serviceRequest);
            if (!updated)
                return NotFound();
            return NoContent();
        }

        // DELETE: api/service/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Manager")]

        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}
