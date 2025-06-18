using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.FeedbackDTO
{
    public class CreateFeedbackDTO
    {
        [Required]
        public Guid ServiceId { get; set; }

        [Required]
        public Guid AccountId { get; set; }

        [Required]
        [StringLength(500, MinimumLength = 5)]
        public string Detail { get; set; } = string.Empty;

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }
    }
} 