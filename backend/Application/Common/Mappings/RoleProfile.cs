using AutoMapper;
using backend.Application.DTOs.Roles;
using backend.Domain.Entities;

namespace backend.Application.Common.Mappings
{
    public class RoleProfile : Profile
    {
        public RoleProfile()
        {
            CreateMap<Role, RoleDto>();
        }
    }
}
