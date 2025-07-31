using AutoMapper;
using backend.Application.DTOs.PaymentDTO;
using backend.Domain.Entities;

namespace backend.Application.Common.Mappings
{
    public class PaymentProfile : Profile
    {
        public PaymentProfile()
        {
            CreateMap<Payment, PaymentDTO>();

            // Payment => PaymentWithBookingInfoDTO
            CreateMap<Payment, PaymentWithBookingInfoDTO>()
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.Booking.Account.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.Booking.Account.LastName))
                .ForMember(dest => dest.CreateAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.Booking.Account.Phone))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Booking.Account.Email))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Booking.Account.Gender));
        }
    }
}
