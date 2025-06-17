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
            CreateMap<Service, TestServiceResponse>();
            
            // DTO to Entity
            CreateMap<CreateTestServiceRequest, Service>();
            CreateMap<UpdateTestServiceRequest, Service>();
        }
    }
} 