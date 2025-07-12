using backend.Application.DTOs.BookingDetailDTO;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace backend.Application.Services
{
    public interface IBookingDetailService
    {
        // Create
        Task<BookingDetailResponse> CreateAsync(CreateBookingDetailRequest request);
        
        // Read
        Task<BookingDetailResponse> GetByIdAsync(Guid id);
        Task<List<BookingDetailResponse>> GetByBookingIdAsync(Guid bookingId);
        
        // Update
        Task<BookingDetailResponse> UpdateInfoOnlyAsync(Guid bookingDetailId, UpdateBookingDetailRequest request);
        Task<BookingDetailResponse> UpdateStatusAsync(Guid bookingDetailId, string status);
        
        // Delete
        Task<bool> DeleteAsync(Guid id);
        
        // Calculate total amount for a booking
        Task<BookingTotalAmountResponse> CalculateTotalAmountByBookingIdAsync(Guid bookingId);

        Task<string?> UploadTestResultAsync(Guid bookingDetailId, IFormFile file);

        Task<List<BookingDetailResponse>> GetByServiceIdAsync(Guid serviceId, string status = null);

        Task<bool> ConfirmBookingDetailAsync(Guid bookingDetailId);
        Task<List<BookingDetailResponse>> GetAllAsync(string status = null);

        Task<List<BookingDetailResponse>> GetPaidByAccountIdAsync(Guid accountId);
    }
}
