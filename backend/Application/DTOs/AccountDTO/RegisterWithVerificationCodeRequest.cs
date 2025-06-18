namespace backend.Application.DTOs.Accounts
{
    public class RegisterWithVerificationCodeRequest
    {
       public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string FirstName { get; set; } = default!;
        public string LastName { get; set; } = default!;
        public string Phone { get; set; } = default!;
        public string? AvatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public bool Gender { get; set; }
        public string VerificationCode { get; set; } = default!;
    }
} 