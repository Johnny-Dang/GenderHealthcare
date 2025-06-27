namespace backend.Application.DTOs.ConsultantDTO
{
    public class ConsultantUpdateRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Department { get; set; }
        public string? Degree { get; set; }
        public int? YearOfExperience { get; set; }
        public string? Biography { get; set; }
    }
}
