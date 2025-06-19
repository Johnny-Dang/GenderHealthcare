using backend.Application.DTOs.FeedbackDTO;
using backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<FeedbackDTO>>> GetAllFeedbacks()
        {
            var feedbacks = await _feedbackService.GetAllFeedbacksAsync();
            return Ok(feedbacks);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<FeedbackDTO>> GetFeedbackById(Guid id)
        {
            var feedback = await _feedbackService.GetFeedbackByIdAsync(id);
            if (feedback == null)
            {
                return NotFound();
            }
            return Ok(feedback);
        }

        [HttpGet("service/{serviceId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<FeedbackDTO>>> GetFeedbacksByServiceId(Guid serviceId)
        {
            var feedbacks = await _feedbackService.GetFeedbacksByServiceIdAsync(serviceId);
            return Ok(feedbacks);
        }

        [HttpGet("account/{accountId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<FeedbackDTO>>> GetFeedbacksByAccountId(Guid accountId)
        {
            var feedbacks = await _feedbackService.GetFeedbacksByAccountIdAsync(accountId);
            return Ok(feedbacks);
        }

        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<FeedbackDTO>> CreateFeedback(CreateFeedbackDTO createFeedbackDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdFeedback = await _feedbackService.CreateFeedbackAsync(createFeedbackDTO);
            return CreatedAtAction(nameof(GetFeedbackById), new { id = createdFeedback.FeedbackId }, createdFeedback);
        }

        [HttpPut]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<FeedbackDTO>> UpdateFeedback(UpdateFeedbackDTO updateFeedbackDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedFeedback = await _feedbackService.UpdateFeedbackAsync(updateFeedbackDTO);
            if (updatedFeedback == null)
            {
                return NotFound();
            }
            return Ok(updatedFeedback);
        }

        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> DeleteFeedback(Guid id)
        {
            var result = await _feedbackService.DeleteFeedbackAsync(id);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}
