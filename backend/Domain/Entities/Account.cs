using backend.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace DeployGenderSystem.Domain.Entity
{
    public class Account
    {
        public Guid User_Id { get; set; }
        public Guid RoleId { get; set; }
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? avatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public bool Gender { get; set; }
        public DateTime CreateAt { get; set; }
        public DateTime? UpdateAt { get; set; }

        public virtual ICollection<RefreshToken> RefreshToken { get; set; } = new List<RefreshToken>();
        public virtual StaffInfo? StaffInfo { get; set; }
        public virtual Role Role { get; set; } = default!;

        // Navigation properties
        public virtual ICollection<Booking> UserServiceBookings { get; set; } = new List<Booking>();
        public virtual ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();

    }
}
