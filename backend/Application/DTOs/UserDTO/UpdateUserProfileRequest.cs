namespace backend.Application.DTOs.UserDTO
{
    public class UpdateUserProfileRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public bool? Gender { get; set; }
        public string? Department { get; set; }
        public string? Degree { get; set; }
        public int? YearOfExperience { get; set; }
        public string? Biography { get; set; }
    }
}
