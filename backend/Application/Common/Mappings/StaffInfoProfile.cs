using AutoMapper;
using backend.Application.DTOs.StaffInfoDTO;
using backend.Domain.Entities;

namespace backend.Application.Common.Mappings
{
    public class StaffInfoProfile : Profile
    {
        public StaffInfoProfile()
        {
            CreateMap<StaffInfo, StaffInfoDto>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Account.Email))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => 
                    $"{src.Account.FirstName} {src.Account.LastName}".Trim()))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Account.Phone))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.Account.AvatarUrl));

            CreateMap<CreateStaffInfoRequest, StaffInfo>();
            CreateMap<UpdateStaffInfoRequest, StaffInfo>();
        }
    }
} 