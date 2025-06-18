using AutoMapper;
using backend.Application.DTOs.FeedbackDTO;
using backend.Domain.Entities;

namespace backend.Application.Common.Mappings
{
    public class FeedbackProfile : Profile
    {
        public FeedbackProfile()
        {
            CreateMap<Feedback, FeedbackDTO>()
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.TestService.ServiceName))
                .ForMember(dest => dest.AccountName, opt => opt.MapFrom(src => src.Account.FirstName + src.Account.LastName));

            CreateMap<CreateFeedbackDTO, Feedback>();
            CreateMap<UpdateFeedbackDTO, Feedback>();
        }
    }
} 