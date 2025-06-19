using AutoMapper;
using backend.Application.DTOs.ServiceDTO;
using backend.Domain.Entities;

namespace backend.Application.Common.Mappings
{
    public class TestServiceProfile : Profile
    {
        public TestServiceProfile()
        {
            // Entity to DTO
            CreateMap<TestService, TestServiceResponse>();
            
            // DTO to Entity
            CreateMap<CreateTestServiceRequest, TestService>();
            CreateMap<UpdateTestServiceRequest, TestService>();
        }
    }
} 