using backend.Application.DTOs.BookingDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;

namespace backend.Infrastructure.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IMapper _mapper;
        
        public BookingService(IBookingRepository bookingRepository, IMapper mapper)
        {
            _bookingRepository = bookingRepository;
            _mapper = mapper;
        }
        
        // Create a booking
        public async Task<BookingResponse> CreateAsync(CreateBookingRequest request)
        {
            try
            {
                // Create booking entity
                var booking = new Booking
                {
                    BookingId = Guid.NewGuid(), // Explicitly generate a new GUID
                    AccountId = request.AccountId,
                    CreateAt = DateTime.UtcNow
                };
                
                // Save booking to get ID
                var createdBooking = await _bookingRepository.CreateAsync(booking);
                
                // Map to response
                return MapToDetailedResponse(createdBooking);
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error creating booking: {ex.Message}");
                throw; // Rethrow to let the controller handle it
            }
        }
        
        // Get booking by ID
        public async Task<BookingResponse> GetByIdAsync(Guid id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking == null)
                return null;
                
            return MapToDetailedResponse(booking);
        }
        
        // Get all bookings
        public async Task<List<BookingResponse>> GetAllAsync()
        {
            var bookings = await _bookingRepository.GetAllAsync();
            var responses = new List<BookingResponse>();
            
            foreach (var booking in bookings)
            {
                responses.Add(MapToDetailedResponse(booking));
            }
            
            return responses;
        }
        
        // Get bookings by account ID
        public async Task<IEnumerable<BookingResponse>> GetByAccountIdAsync(Guid accountId)
        {
            var bookings = await _bookingRepository.GetByAccountIdAsync(accountId);
            return _mapper.Map<IEnumerable<BookingResponse>>(bookings);
        }
        
        // Update booking
        public async Task<BookingResponse> UpdateAsync(UpdateBookingRequest request)
        {
            // Check if booking exists
            var existingBooking = await _bookingRepository.GetByIdAsync(request.BookingId);
            if (existingBooking == null)
                return null;
                
            // Update booking details if provided
            if (request.BookingDetails != null && request.BookingDetails.Any())
            {
                var updatedDetails = new List<BookingDetail>();
                
                foreach (var detailDto in request.BookingDetails)
                {
                    // Find existing detail or create new one
                    var detail = existingBooking.BookingDetails.FirstOrDefault(d => d.BookingDetailId == detailDto.BookingDetailId);
                    
                    if (detail != null)
                    {
                        // Update existing detail
                        detail.ServiceId = detailDto.ServiceId;
                        detail.FirstName = detailDto.FirstName;
                        detail.LastName = detailDto.LastName;
                        detail.Phone = detailDto.Phone; // Assuming Phone is part of BookingDetail
                        detail.DateOfBirth = detailDto.DateOfBirth;
                        detail.Gender = detailDto.Gender;
                        updatedDetails.Add(detail);
                    }
                    else
                    {
                        // Create new detail
                        var newDetail = new BookingDetail
                        {
                            BookingDetailId = detailDto.BookingDetailId != Guid.Empty ? detailDto.BookingDetailId : Guid.NewGuid(),
                            BookingId = existingBooking.BookingId,
                            ServiceId = detailDto.ServiceId,
                            FirstName = detailDto.FirstName,
                            LastName = detailDto.LastName,
                            Phone = detailDto.Phone, // Assuming Phone is part of BookingDetail
                            DateOfBirth = detailDto.DateOfBirth,
                            Gender = detailDto.Gender
                        };
                        
                        updatedDetails.Add(newDetail);
                    }
                }
                
                // Replace booking details with updated list
                existingBooking.BookingDetails = updatedDetails;
            }
            
            // Update timestamp
            existingBooking.UpdateAt = DateTime.UtcNow;
            
            // Save changes
            var updatedBooking = await _bookingRepository.UpdateAsync(existingBooking);
            
            // Return updated booking
            return MapToDetailedResponse(updatedBooking);
        }
        
        // Delete a booking
        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _bookingRepository.DeleteAsync(id);
        }
        
        // Helper method for mapping with details
        private BookingResponse MapToDetailedResponse(Booking booking)
        {
            if (booking == null) return null;
            
            string accountName = string.Empty;
            if (booking.Account != null)
            {
                accountName = (booking.Account.FirstName ?? string.Empty) + " " + (booking.Account.LastName ?? string.Empty);
            }
            
            decimal totalAmount = 0;
            // Safely check if PaymentHistory exists before accessing Amount
            if (booking.PaymentHistory != null)
            {
                totalAmount = booking.PaymentHistory.Amount;
            }
            
            var response = new BookingResponse
            {
                BookingId = booking.BookingId,
                AccountId = booking.AccountId,
                CreateAt = booking.CreateAt,
                UpdateAt = booking.UpdateAt,
            };
            return response;
        }
    }
}
