using backend.Domain.Entities;
using DeployGenderSystem.Domain.Entity;

namespace backend.Application.DTOs.Accounts
{
    public class CreateAccountRequest
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public bool Gender { get; set; }
    }
}
