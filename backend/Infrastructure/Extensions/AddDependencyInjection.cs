using backend.Application.Common.Mappings;
using backend.Application.Interfaces;
using backend.Application.Services;
using backend.Infrastructure.Persistence;
using backend.Infrastructure.Services;
using System.Net.NetworkInformation;
using System.Runtime.CompilerServices;

namespace backend.Infrastructure.Extensions
{
    public static class AddDependencyInjection
    {
        public static void AddService(this IServiceCollection serviceCollection)
        {
            serviceCollection.AddScoped<IRoleService, RoleService>();
            serviceCollection.AddScoped<IAccountService, AccountService>();
<<<<<<< HEAD
=======
            
>>>>>>> 292d8062ac651ef538500e6b65f204a94616d352
        }
    }
}
