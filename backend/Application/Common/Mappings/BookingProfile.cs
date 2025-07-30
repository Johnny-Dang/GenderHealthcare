using AutoMapper;
using backend.Domain.Entities;
using backend.Application.DTOs.BookingDTO;

namespace backend.Application.Common.Mappings
{
    public class BookingProfile : Profile
    {
        public BookingProfile()
        {
            CreateMap<Booking, BookingResponse>();

            CreateMap<Booking, BookingWithPaymentResponse>()
                .ForMember(dest => dest.HasPayment, opt => opt.MapFrom(src => src.Payment != null))
                .ForMember(dest => dest.PaymentAmount, opt => opt.MapFrom(src => src.Payment != null ? src.Payment.Amount : (decimal?)null))
                .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.Payment != null ? src.Payment.PaymentMethod : null))
                .ForMember(dest => dest.TransactionId, opt => opt.MapFrom(src => src.Payment != null ? src.Payment.TransactionId : null))
                .ForMember(dest => dest.PaymentCreatedAt, opt => opt.MapFrom(src => src.Payment != null ? src.Payment.CreatedAt : (DateTime?)null));
        }
    }
} 