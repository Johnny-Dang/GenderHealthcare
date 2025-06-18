using backend.Application.Common.Mappings;
using backend.Application.Services;
using backend.Application.Repositories;
using backend.Infrastructure.Database;
using backend.Infrastructure.Repositories;
using backend.Infrastructure.Services;
using System.Net.NetworkInformation;
using System.Runtime.CompilerServices;
using backend.Application.Interfaces;

namespace backend.Infrastructure.Extensions
{
    public static class AddDependencyInjection
    {
        public static void AddService(this IServiceCollection serviceCollection)
        {
            serviceCollection.AddDbContext<IApplicationDbContext, ApplicationDbContext>();
            serviceCollection.AddScoped<IRoleService, RoleService>();
            serviceCollection.AddScoped<IAccountService, AccountService>();
            serviceCollection.AddScoped<ITokenService, TokenService>();
            serviceCollection.AddScoped<IGoogleCredentialService, GoogleCredentialService>();
            serviceCollection.AddScoped<IEmailService, SendGridEmailService>();
            serviceCollection.AddScoped<IVerificationCodeService, VerificationCodeService>();
            serviceCollection.AddScoped<IServicesService, ServicesService>();
            serviceCollection.AddScoped<IBlogService, BlogService>();
            serviceCollection.AddScoped<IBlogCategoryService, BlogCategoryService>();
            serviceCollection.AddScoped<IConsultationBookingService, ConsultationBookingService>();
            serviceCollection.AddScoped<IConsultantService, ConsultantService>();
            serviceCollection.AddScoped<IBookingService, BookingService>();
            
            // Repositories
            serviceCollection.AddScoped<IServicesServiceRepository, ServicesRepository>();
            serviceCollection.AddScoped<IBookingRepository, BookingRepository>();
            serviceCollection.AddScoped<IBlogRepository, BlogRepository>();
            serviceCollection.AddScoped<IBlogCategoryRepository, BlogCategoryRepository>();
            serviceCollection.AddScoped<IAccountRepository, AccountRepository>();
            serviceCollection.AddScoped<IRoleRepository, RoleRepository>();
            serviceCollection.AddScoped<IBookingDetailRepository, BookingDetailRepository>();
            serviceCollection.AddScoped<ITokenRepository, TokenRepository>();
            serviceCollection.AddScoped<IGoogleCredentialRepository, GoogleCredentialRepository>();
        }
    }
}
