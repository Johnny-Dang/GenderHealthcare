namespace backend.Application.DTOs.Roles
{
    public class CreateRoleRequest
    {
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
    }
}
