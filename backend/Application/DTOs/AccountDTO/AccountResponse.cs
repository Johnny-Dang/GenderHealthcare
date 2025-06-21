namespace backend.Application.DTOs.AccountDTO
{
    public class AccountResponse
    {
        public Guid AccountId { get; set; }
        public string Email { get; set; } = default!;
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public bool Gender { get; set; }
        public DateTime CreateAt { get; set; }
        public string RoleName { get; set; } = default!;
    }
}
