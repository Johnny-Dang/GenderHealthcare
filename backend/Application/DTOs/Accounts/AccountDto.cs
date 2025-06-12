namespace backend.Application.DTOs.Accounts
{
    public class AccountDto
    {
        public Guid User_Id { get; set; }
        public string Email { get; set; } = default!;
        public string? FullName => $"{FirstName} {LastName}".Trim();
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public bool Gender { get; set; }
        public string RoleName { get; set; } = default!;
        public bool IsEmailVerified { get; internal set; }
    }
}

