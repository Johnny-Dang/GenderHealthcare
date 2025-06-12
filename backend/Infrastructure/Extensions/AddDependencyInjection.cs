using backend.Application.Common.Mappings;
using backend.Application.Interfaces;
using backend.Application.Services;
using backend.Infrastructure.Database;
using backend.Infrastructure.Persistence;
using System.Net.NetworkInformation;
using System.Runtime.CompilerServices;
using backend.Infrastructure.Services;

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
            serviceCollection.AddScoped<ITestService, TestService>();
        }
    }
}
