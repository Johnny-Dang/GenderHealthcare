namespace backend.Application.DTOs.AdminDashboardDTO
{
    public class RecentUserDto
    {
        public Guid AccountId { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public DateTime CreateAt { get; set; }
        public bool IsActive { get; set; }
    }
}
