using backend.Application.DTOs.BookingDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Entities;
using AutoMapper;

namespace backend.Infrastructure.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IMapper _mapper;
        private readonly IBookingDetailService _bookingDetailService;

        public BookingService(IBookingRepository bookingRepository, IMapper mapper, IBookingDetailService bookingDetailService)
        {
            _bookingRepository = bookingRepository;
            _mapper = mapper;
            _bookingDetailService = bookingDetailService;
        }
        public async Task<BookingResponse> CreateAsync(CreateBookingRequest request)
        {
            try
            {
                var booking = new Booking
                {
                    BookingId = Guid.NewGuid(), // Explicitly generate a new GUID
                    AccountId = request.AccountId,
                    CreateAt = DateTime.UtcNow
                };
                var createdBooking = await _bookingRepository.CreateAsync(booking);

                return _mapper.Map<BookingResponse>(createdBooking);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating booking: {ex.Message}");
                throw;
            }
        }
        
        public async Task<BookingResponse> GetByIdAsync(Guid id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);

            return booking != null ? _mapper.Map<BookingResponse>(booking) : null;
        }
        
        public async Task<List<BookingResponse>> GetAllAsync()
        {
            var bookings = await _bookingRepository.GetAllAsync();

            return _mapper.Map<List<BookingResponse>>(bookings);
        }
        
        public async Task<IEnumerable<BookingWithPaymentResponse>> GetByAccountIdAsync(Guid accountId)
        {
            var bookings = await _bookingRepository.GetByAccountIdAsync(accountId);

            return _mapper.Map<List<BookingWithPaymentResponse>>(bookings);
        }
        
        public async Task<BookingResponse> UpdateAsync(UpdateBookingRequest request)
        {
            var existingBooking = await _bookingRepository.GetByIdAsync(request.BookingId);
            if (existingBooking == null)
                return null;
                
            if (request.BookingDetails != null && request.BookingDetails.Any())
            {
                var updatedDetails = new List<BookingDetail>();
                
                foreach (var detailDto in request.BookingDetails)
                {
                    var detail = existingBooking.BookingDetails.FirstOrDefault(d => d.BookingDetailId == detailDto.BookingDetailId);
                    
                    if (detail != null)
                    {
                        detail.ServiceId = detailDto.ServiceId;
                        detail.FirstName = detailDto.FirstName;
                        detail.LastName = detailDto.LastName;
                        detail.Phone = detailDto.Phone; 
                        detail.DateOfBirth = detailDto.DateOfBirth;
                        detail.Gender = detailDto.Gender;
                        updatedDetails.Add(detail);
                    }
                    else
                    {
                        var newDetail = new BookingDetail
                        {
                            BookingDetailId = detailDto.BookingDetailId != Guid.Empty ? detailDto.BookingDetailId : Guid.NewGuid(),
                            BookingId = existingBooking.BookingId,
                            ServiceId = detailDto.ServiceId,
                            FirstName = detailDto.FirstName,
                            LastName = detailDto.LastName,
                            Phone = detailDto.Phone, 
                            DateOfBirth = detailDto.DateOfBirth,
                            Gender = detailDto.Gender
                        };
                        
                        updatedDetails.Add(newDetail);
                    }
                }
                existingBooking.BookingDetails = updatedDetails;
            }
            
            existingBooking.UpdateAt = DateTime.UtcNow;
            
            var updatedBooking = await _bookingRepository.UpdateAsync(existingBooking);

            return _mapper.Map<BookingResponse>(updatedBooking);
        }
        
        public async Task<bool> DeleteAsync(Guid id)
        {
            var bookingDetails = await _bookingDetailService.GetByBookingIdAsync(id);
            if (bookingDetails != null)
            {
                foreach (var detail in bookingDetails)
                {
                    await _bookingDetailService.DeleteAsync(detail.BookingDetailId);
                }
            }
            return await _bookingRepository.DeleteAsync(id);
        }

        public async Task<bool> UpdateStatusAsync(Guid bookingId, string status)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
                return false;
            booking.Status = status;
            await _bookingRepository.UpdateAsync(booking);
            return true;
        }
    }
}
