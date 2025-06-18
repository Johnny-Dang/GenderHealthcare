namespace backend.Application.DTOs.ConsultantDTO
{
    public class ConsultantResponse
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }

        // Thông tin chuyên môn từ StaffInfo
        public string? Department { get; set; }
        public string? Degree { get; set; }
        public int YearOfExperience { get; set; }
        public string? Biography { get; set; }
    }
}
