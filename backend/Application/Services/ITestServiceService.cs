using AutoMapper;
using backend.Application.DTOs.ServiceDTO;
using backend.Application.Interfaces;
using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Services
{
    public interface ITestServiceService
    {
        Task<TestServiceResponse> CreateAsync(CreateTestServiceRequest request);
        Task<List<TestServiceResponse>> GetAllAsync();
        Task<TestServiceResponse> GetByIdAsync(Guid id);
        Task<List<TestServiceResponse>> GetByCategoryAsync(string category);
        Task<TestServiceResponse> UpdateAsync(Guid id, UpdateTestServiceRequest request);
        Task<bool> DeleteAsync(Guid id);
        Task<List<TestServiceAdminResponse>> GetAllForAdminAsync();
    }
} 