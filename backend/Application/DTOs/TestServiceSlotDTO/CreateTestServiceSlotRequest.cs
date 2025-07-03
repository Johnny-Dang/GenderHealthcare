using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.TestServiceSlotDTO
{
    public class CreateTestServiceSlotRequest
    {
        [Required]
        public Guid ServiceId { get; set; }

        [Required]
        public DateOnly SlotDate { get; set; }

        [Required]
        [RegularExpression("^(AM|PM)$", ErrorMessage = "Shift phải là 'AM' hoặc 'PM'")]
        public string Shift { get; set; } = default!;

        [Required]
        [Range(1, 100)]
        public int MaxQuantity { get; set; } = 10;
    }
}
