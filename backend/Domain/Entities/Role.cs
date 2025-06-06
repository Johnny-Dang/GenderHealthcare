using DeployGenderSystem.Domain.Entity;

namespace backend.Domain.Entities
{
    public class Role
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public virtual ICollection<Account> Accounts { get; set; } = [];

    }
}
