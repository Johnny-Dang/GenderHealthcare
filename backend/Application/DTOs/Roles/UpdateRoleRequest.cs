namespace backend.Application.DTOs.Roles
{
    public class UpdateRoleRequest
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
    }
}
