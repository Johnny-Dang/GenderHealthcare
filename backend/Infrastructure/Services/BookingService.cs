﻿using backend.Application.DTOs.BookingDTO;
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
        private readonly IBookingDetailService _bookingDetailService;

        public BookingService(IBookingRepository bookingRepository, IMapper mapper, IBookingDetailService bookingDetailService)
        {
            _bookingRepository = bookingRepository;
            _mapper = mapper;
            _bookingDetailService = bookingDetailService;
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
        public async Task<IEnumerable<BookingWithPaymentResponse>> GetByAccountIdAsync(Guid accountId)
        {
            var bookings = await _bookingRepository.GetByAccountIdAsync(accountId);
            var responses = new List<BookingWithPaymentResponse>();
            
            foreach (var booking in bookings)
            {
                responses.Add(MapToBookingWithPaymentResponse(booking));
            }
            
            return responses;
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
        
        // Update only status
        public async Task<bool> UpdateStatusAsync(Guid bookingId, string status)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
                return false;
            booking.Status = status;
            await _bookingRepository.UpdateAsync(booking);
            return true;
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
            if (booking.Payment != null)
            {
                totalAmount = booking.Payment.Amount;
            }
            
            var response = new BookingResponse
            {
                BookingId = booking.BookingId,
                AccountId = booking.AccountId,
                Status = booking.Status,
                CreateAt = booking.CreateAt,
                UpdateAt = booking.UpdateAt,
            };
            return response;
        }
        
        // Helper method for mapping booking with payment information
        private BookingWithPaymentResponse MapToBookingWithPaymentResponse(Booking booking)
        {
            if (booking == null) return null;
            
            var response = new BookingWithPaymentResponse
            {
                BookingId = booking.BookingId,
                AccountId = booking.AccountId,
                Status = booking.Status,
                CreateAt = booking.CreateAt,
                UpdateAt = booking.UpdateAt,
                HasPayment = booking.Payment != null,
                PaymentAmount = booking.Payment?.Amount,
                PaymentMethod = booking.Payment?.PaymentMethod,
                TransactionId = booking.Payment?.TransactionId,
                PaymentCreatedAt = booking.Payment?.CreatedAt
            };
            
            return response;
        }
    }
}
