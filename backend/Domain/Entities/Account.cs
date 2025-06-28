using backend.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace DeployGenderSystem.Domain.Entity
{
    public class Account
    {
        public Guid AccountId { get; set; }
        public Guid RoleId { get; set; }
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public bool Gender { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime CreateAt { get; set; }
        public DateTime? UpdateAt { get; set; }

        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public virtual StaffInfo? StaffInfo { get; set; }
        public virtual Role Role { get; set; } = default!;
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

        // Navigation properties
        public virtual ICollection<ConsultationBooking> CustomerBookings { get; set; } = new List<ConsultationBooking>();
        public virtual ICollection<ConsultationBooking> StaffBookings { get; set; } = new List<ConsultationBooking>();

    }
}
