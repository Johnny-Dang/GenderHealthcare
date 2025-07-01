using backend.Application.DTOs.NotificationDTO;
using backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController: ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserNotifications()
        {
            // Lấy userId từ token JWT
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var result = await _notificationService.GetNotificationsForUserAsync(userGuid);

            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return Ok(result.Data);
        }

        [HttpGet("unread")]
        public async Task<IActionResult> GetUnreadNotifications()
        {
            // Lấy userId từ token JWT
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var result = await _notificationService.GetUnreadNotificationsForUserAsync(userGuid);

            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return Ok(result.Data);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            // Lấy userId từ token JWT
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var result = await _notificationService.GetUnreadNotificationCountAsync(userGuid);

            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return Ok(result.Data);
        }

        [HttpPut("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(Guid notificationId)
        {
            var result = await _notificationService.MarkNotificationAsReadAsync(notificationId);

            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return Ok(result.Data);
        }

        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var result = await _notificationService.MarkAllNotificationsAsReadAsync(userGuid);

            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return Ok(result.Data);
        }

        [HttpDelete("{notificationId}")]
        public async Task<IActionResult> DeleteNotification(Guid notificationId)
        {
            var result = await _notificationService.DeleteNotificationAsync(notificationId);

            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return Ok(result.Data);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Staff,Manager")]
        public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationRequest request)
        {
            var result = await _notificationService.CreateNotificationAsync(request);

            if (!result.IsSuccess)
                return BadRequest(result.Error);

            return Ok(result.Data);
        }
    }
}
