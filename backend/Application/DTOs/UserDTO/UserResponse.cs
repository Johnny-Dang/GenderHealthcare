namespace backend.Application.DTOs.UserDTO
{
    public class UserResponse
    {
        public Guid AccountId { get; set; }
        public string Email { get; set; } = default!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public bool Gender { get; set; }
        public string RoleName { get; set; } = default!;
        public string? Department { get; set; }
        public string? Degree { get; set; }
        public int? YearOfExperience { get; set; }
        public string? Biography { get; set; }
    }
}
