using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class StaffInfo
    {
        public Guid AccountId { get; set; }

        public string DepartmentId { get; set; }

        public string Degree { get; set; }

        public int YearOfExperience { get; set; }

        public string Biography { get; set; }

        public virtual Account Account { get; set; }

    }
}
