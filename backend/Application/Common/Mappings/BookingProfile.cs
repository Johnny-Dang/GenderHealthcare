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
        }
    }
} 