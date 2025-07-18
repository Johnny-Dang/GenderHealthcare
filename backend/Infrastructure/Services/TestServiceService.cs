﻿using backend.Application.DTOs.ServiceDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using SendGrid.Helpers.Mail;

namespace backend.Infrastructure.Services
{
    public class TestServiceService : ITestServiceService
    {
        private readonly ITestServiceRepository _testServiceRepository;
        
        public TestServiceService(ITestServiceRepository testServiceRepository)
        {
            _testServiceRepository = testServiceRepository;
        }

        public async Task<TestServiceResponse> CreateAsync(CreateTestServiceRequest request)
        {
            var service = new TestService
            {
                ServiceId = Guid.NewGuid(),
                ServiceName = request.ServiceName,
                Description = request.Description,
                Title = request.Title, 
                Price = request.Price,
                Category = request.Category,
                ImageUrl = request.ImageUrl,
                CreatedAt = DateTime.UtcNow
            };

            var createdService = await _testServiceRepository.AddAsync(service);

            return MapToResponse(createdService);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _testServiceRepository.DeleteAsync(id);
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _testServiceRepository.ExistsAsync(id);
        }

        public async Task<List<TestServiceResponse>> GetAllAsync()
        {
            var services = await _testServiceRepository.GetAllAsync();
            return services.Select(MapToResponse).ToList();
        }

        public async Task<List<TestServiceResponse>> GetByCategoryAsync(string category)
        {
            var services = await _testServiceRepository.GetByCategoryAsync(category);
            return services.Select(MapToResponse).ToList();
        }

        public async Task<TestServiceResponse> GetByIdAsync(Guid id)
        {
            var service = await _testServiceRepository.GetByIdAsync(id);
            return service == null ? null : MapToResponse(service);
        }

        public async Task<TestServiceResponse> UpdateAsync(Guid id, UpdateTestServiceRequest request)
        {
            var existingService = await _testServiceRepository.GetByIdAsync(id);
            
            if (existingService == null)
                return null;
                
            existingService.ServiceName = request.ServiceName;
            existingService.Description = request.Description;
            existingService.Title = request.Title; 
            existingService.Price = request.Price;
            existingService.Category = request.Category;
            existingService.ImageUrl = request.ImageUrl;
            existingService.UpdatedAt = DateTime.UtcNow;
            existingService.IsDeleted = request.IsDeleted;
            var updatedService = await _testServiceRepository.UpdateAsync(existingService);
            return MapToResponse(updatedService);
        }

        public async Task<List<TestServiceAdminResponse>> GetAllForAdminAsync()
        {
            var services = await _testServiceRepository.GetAllForAdminAsync();
            return services.Select(MapToAdminResponse).ToList();
        }
        
        // Helper method to map Service to TestServiceResponse
        private TestServiceResponse MapToResponse(TestService service)
        {
            return new TestServiceResponse
            {
                ServiceId = service.ServiceId,
                ServiceName = service.ServiceName,
                Title = service.Title,
                Description = service.Description,
                Price = service.Price,
                Category = service.Category,
                ImageUrl = service.ImageUrl,
                CreatedAt = service.CreatedAt,
                UpdatedAt = service.UpdatedAt
            };
        }

        private TestServiceAdminResponse MapToAdminResponse(TestService service)
        {
            return new TestServiceAdminResponse
            {
                ServiceId = service.ServiceId,
                ServiceName = service.ServiceName,
                Title = service.Title,
                Description = service.Description,
                Price = service.Price,
                Category = service.Category,
                ImageUrl = service.ImageUrl,
                CreatedAt = service.CreatedAt,
                UpdatedAt = service.UpdatedAt,
                IsDeleted = service.IsDeleted
            };
        }
    }
}
