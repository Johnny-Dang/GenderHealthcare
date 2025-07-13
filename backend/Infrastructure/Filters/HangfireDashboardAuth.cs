using Hangfire.Dashboard;

namespace backend.Infrastructure.Filters
{
    public class AdminDashboardAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            var httpContext = context.GetHttpContext();
            
            // Kiểm tra user đã đăng nhập và có role Admin
            return httpContext.User.Identity?.IsAuthenticated == true &&
                   httpContext.User.IsInRole("Admin");
        }
    }
} 