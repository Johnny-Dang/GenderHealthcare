using AutoMapper;
using backend.Application.DTOs.ServiceDTO;
using backend.Domain.Entities;

namespace backend.Application.Common.Mappings
{
    public class TestServiceProfile : Profile
    {
        public TestServiceProfile()
        {
            CreateMap<TestService, TestServiceResponse>();
            CreateMap<CreateTestServiceRequest, TestService>();
            CreateMap<UpdateTestServiceRequest, TestService>();
            CreateMap<TestService, TestServiceAdminResponse>();
        }
    }
} 