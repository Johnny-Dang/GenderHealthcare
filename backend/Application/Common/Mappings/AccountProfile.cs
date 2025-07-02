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

            CreateMap<RegisterRequest, Account>();

            // Bug *****
            CreateMap<Account, AccountDto>()
            .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name))
            .ForMember(dest => dest.User_Id, opt => opt.MapFrom(src => src.AccountId));

            CreateMap<UpdateAccountRequest, Account>();
        }

    }
}
