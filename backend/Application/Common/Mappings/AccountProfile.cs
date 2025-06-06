using AutoMapper;
using backend.Application.DTOs.Accounts;
using DeployGenderSystem.Domain.Entity;

namespace backend.Application.Common.Mappings
{
    public class AccountProfile : Profile
    {
        public AccountProfile()
        {
            //CreateMap<Account, AccountDto>();

            CreateMap<CreateAccountRequest, Account>();

        }

    }
}
