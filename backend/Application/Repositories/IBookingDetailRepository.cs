﻿using backend.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Application.Repositories
{
    public interface IBookingDetailRepository
    {
        // Create
        Task<BookingDetail> CreateAsync(BookingDetail bookingDetail);
        
        // Read
        Task<BookingDetail> GetByIdAsync(Guid id);
        Task<List<BookingDetail>> GetByBookingIdAsync(Guid bookingId);
        
        // Update
        Task<BookingDetail> UpdateAsync(BookingDetail bookingDetail);
        
        // Delete
        Task<bool> DeleteAsync(Guid id);
        
        // Additional methods
        Task<bool> ExistsAsync(Guid id);
        Task<bool> ExistsBookingAsync(Guid bookingId);
        
        // Calculate total amount for a booking
        Task<decimal> CalculateTotalAmountByBookingIdAsync(Guid bookingId);

        Task<BookingDetail> UpdateStatusAsync(Guid bookingDetailId, string status);
        // này dùng để gửi thông báo
        Task<Booking> GetBookingAsync(Guid bookingId);
        // tự động cập nhật trạng thái của booking detail theo booking id
        Task UpdateStatusByBookingIdAsync(Guid bookingId, string status);

        Task<List<BookingDetail>> GetByServiceIdAsync(Guid serviceId, string status = null);
        Task<List<BookingDetail>> GetAllAsync(string status = null);
        Task<List<BookingDetail>> GetPaidByAccountIdAsync(Guid accountId);
    }
}
