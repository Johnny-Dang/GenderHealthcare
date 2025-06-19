using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class StaffInfo
    {
        public Guid AccountId { get; set; }

        public string Department { get; set; } = default!;

        public string Degree { get; set; } = default!;

        public int YearOfExperience { get; set; }

        public string Biography { get; set; } = default!;

        public DateTime CreateAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdateAt { get; set; } 

        public virtual Account Account { get; set; } = default!;

    }
}
