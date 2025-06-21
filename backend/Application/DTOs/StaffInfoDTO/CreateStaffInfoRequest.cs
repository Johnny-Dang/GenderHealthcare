using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs.StaffInfoDTO
{
    public class CreateStaffInfoRequest
    {
        [Required]
        public Guid AccountId { get; set; }

        [Required]
        [StringLength(50)]
        public string Department { get; set; } = default!;

        [Required]
        [StringLength(100)]
        public string Degree { get; set; } = default!;

        [Required]
        [Range(0, 50)]
        public int YearOfExperience { get; set; }

        [Required]
        [StringLength(1000)]
        public string Biography { get; set; } = default!;
    }
} 