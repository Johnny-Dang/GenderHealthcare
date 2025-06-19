namespace backend.Application.DTOs.StaffInfoDTO
{
    public class StaffInfoDto
    {
        public Guid AccountId { get; set; }
        public string Department { get; set; } = default!;
        public string Degree { get; set; } = default!;
        public int YearOfExperience { get; set; }
        public string Biography { get; set; } = default!;
        public DateTime CreateAt { get; set; }
        public DateTime? UpdateAt { get; set; }
        
        // Additional properties from Account entity for convenience
        public string Email { get; set; } = default!;
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
    }
} 