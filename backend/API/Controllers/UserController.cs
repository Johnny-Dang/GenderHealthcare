using backend.Application.DTOs.UserDTO;
using backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetProfile(Guid id)
        {
            var result = await _userService.GetProfileAsync(id);
            if (result.IsSuccess)
                return Ok(result.Data);
            return NotFound(result.Error);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UpdateUserProfileRequest request)
        {
            var result = await _userService.UpdateProfileAsync(id, request);
            if (result.IsSuccess)
                return Ok(result.Data);
            return BadRequest(result.Error);
        }
    }
}
