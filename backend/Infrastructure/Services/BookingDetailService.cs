using backend.Application.DTOs.BookingDetailDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Infrastructure.Services
{
    public class BookingDetailService : IBookingDetailService
    {
        private readonly IBookingDetailRepository _bookingDetailRepository;
        private readonly ITestServiceRepository _testServiceRepository;

        public BookingDetailService(IBookingDetailRepository bookingDetailRepository, ITestServiceRepository testServiceRepository)
        {
            _bookingDetailRepository = bookingDetailRepository;
            _testServiceRepository = testServiceRepository;
        }

        public async Task<BookingDetailResponse> CreateAsync(CreateBookingDetailRequest request)
        {
            // Check if booking exists
            if (!await _bookingDetailRepository.ExistsBookingAsync(request.BookingId))
                return null;

            // Check if service exists
            var service = await _testServiceRepository.GetByIdAsync(request.ServiceId);
            if (service == null)
                return null;

            // Create booking detail entity
            var bookingDetail = new BookingDetail
            {
                BookingId = request.BookingId,
                ServiceId = request.ServiceId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                DateOfBirth = request.DateOfBirth,
                Phone = request.Phone,
                Gender = request.Gender
            };

            // Save to database
            var createdDetail = await _bookingDetailRepository.CreateAsync(bookingDetail);

            // Map to response
            return new BookingDetailResponse
            {
                BookingDetailId = createdDetail.BookingDetailId,
                BookingId = createdDetail.BookingId,
                ServiceId = createdDetail.ServiceId,
                ServiceName = service.ServiceName,
                Price = service.Price,
                FirstName = createdDetail.FirstName,
                LastName = createdDetail.LastName,
                Phone = createdDetail.Phone,
                DateOfBirth = createdDetail.DateOfBirth,
                Gender = createdDetail.Gender
            };
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _bookingDetailRepository.DeleteAsync(id);
        }

        public async Task<List<BookingDetailResponse>> GetByBookingIdAsync(Guid bookingId)
        {
            var bookingDetails = await _bookingDetailRepository.GetByBookingIdAsync(bookingId);
            var response = new List<BookingDetailResponse>();

            foreach (var detail in bookingDetails)
            {
                response.Add(new BookingDetailResponse
                {
                    BookingDetailId = detail.BookingDetailId,
                    BookingId = detail.BookingId,
                    ServiceId = detail.ServiceId,
                    ServiceName = detail.TestService?.ServiceName ?? string.Empty,
                    Price = detail.TestService?.Price ?? 0,
                    Status = detail.Status,
                    FirstName = detail.FirstName,
                    LastName = detail.LastName,
                    Phone = detail.Phone,
                    DateOfBirth = detail.DateOfBirth,
                    Gender = detail.Gender
                });
            }

            return response;
        }

        public async Task<BookingDetailResponse> GetByIdAsync(Guid id)
        {
            var bookingDetail = await _bookingDetailRepository.GetByIdAsync(id);
            
            if (bookingDetail == null)
                return null;

            return new BookingDetailResponse
            {
                BookingDetailId = bookingDetail.BookingDetailId,
                BookingId = bookingDetail.BookingId,
                ServiceId = bookingDetail.ServiceId,
                ServiceName = bookingDetail.TestService?.ServiceName ?? string.Empty,
                Price = bookingDetail.TestService?.Price ?? 0,
                Status = bookingDetail.Status,
                FirstName = bookingDetail.FirstName,
                LastName = bookingDetail.LastName,
                Phone = bookingDetail.Phone,
                DateOfBirth = bookingDetail.DateOfBirth,
                Gender = bookingDetail.Gender
            };
        }

        public async Task<BookingDetailResponse> UpdateAsync(UpdateBookingDetailRequest request)
        {
            // Check if booking detail exists
            var existingDetail = await _bookingDetailRepository.GetByIdAsync(request.BookingDetailId);
            if (existingDetail == null)
                return null;

            // Update allowed fields only
            existingDetail.FirstName = request.FirstName;
            existingDetail.LastName = request.LastName;
            existingDetail.DateOfBirth = request.DateOfBirth;
            existingDetail.Status = request.Status;
            existingDetail.Phone = request.Phone;
            existingDetail.Gender = request.Gender;

            // Save changes
            var updatedDetail = await _bookingDetailRepository.UpdateAsync(existingDetail);

            // Map to response
            return new BookingDetailResponse
            {
                BookingDetailId = updatedDetail.BookingDetailId,
                BookingId = updatedDetail.BookingId,
                ServiceId = updatedDetail.ServiceId,
                ServiceName = updatedDetail.TestService?.ServiceName ?? string.Empty,
                Price = updatedDetail.TestService?.Price ?? 0,
                Status = updatedDetail.Status,
                FirstName = updatedDetail.FirstName,
                LastName = updatedDetail.LastName,
                Phone = updatedDetail.Phone,
                DateOfBirth = updatedDetail.DateOfBirth,
                Gender = updatedDetail.Gender
            };
        }

        public async Task<BookingDetailResponse> UpdateInfoOnlyAsync(UpdateBookingDetailRequest request)
        {
            // Check if booking detail exists
            var existingDetail = await _bookingDetailRepository.GetByIdAsync(request.BookingDetailId);
            if (existingDetail == null)
                return null;

            // Update allowed fields only (không update status)
            existingDetail.FirstName = request.FirstName;
            existingDetail.LastName = request.LastName;
            existingDetail.DateOfBirth = request.DateOfBirth;
            existingDetail.Phone = request.Phone;
            existingDetail.Gender = request.Gender;

            // Save changes
            var updatedDetail = await _bookingDetailRepository.UpdateAsync(existingDetail);

            // Map to response
            return new BookingDetailResponse
            {
                BookingDetailId = updatedDetail.BookingDetailId,
                BookingId = updatedDetail.BookingId,
                ServiceId = updatedDetail.ServiceId,
                ServiceName = updatedDetail.TestService?.ServiceName ?? string.Empty,
                Price = updatedDetail.TestService?.Price ?? 0,
                Status = updatedDetail.Status,
                FirstName = updatedDetail.FirstName,
                LastName = updatedDetail.LastName,
                Phone = updatedDetail.Phone,
                DateOfBirth = updatedDetail.DateOfBirth,
                Gender = updatedDetail.Gender
            };
        }
        
        public async Task<BookingTotalAmountResponse> CalculateTotalAmountByBookingIdAsync(Guid bookingId)
        {
            // Check if booking exists
            if (!await _bookingDetailRepository.ExistsBookingAsync(bookingId))
                return null;
                
            // Get booking details
            var bookingDetails = await _bookingDetailRepository.GetByBookingIdAsync(bookingId);
            
            // Calculate total amount
            decimal totalAmount = await _bookingDetailRepository.CalculateTotalAmountByBookingIdAsync(bookingId);
            
            // Create response
            return new BookingTotalAmountResponse
            {
                BookingId = bookingId,
                TotalAmount = totalAmount,
                ServiceCount = bookingDetails.Count
            };
        }
    }
}
