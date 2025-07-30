using AutoMapper;
using backend.Application.DTOs.ServiceDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Entities;

namespace backend.Infrastructure.Services
{
    public class TestServiceService : ITestServiceService
    {
        private readonly ITestServiceRepository _testServiceRepository;
        private readonly IMapper _mapper;
        
        public TestServiceService(ITestServiceRepository testServiceRepository,IMapper mapper)
        {
            _testServiceRepository = testServiceRepository;
            _mapper = mapper;
        }

        public async Task<TestServiceResponse> CreateAsync(CreateTestServiceRequest request)
        {
            try
            {
                var service = _mapper.Map<TestService>(request);
                service.ServiceId = Guid.NewGuid();
                service.CreatedAt = DateTime.UtcNow;

                var created = await _testServiceRepository.AddAsync(service);
                return _mapper.Map<TestServiceResponse>(created);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating test service: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _testServiceRepository.DeleteAsync(id);
        }

        public async Task<List<TestServiceResponse>> GetAllAsync()
        {
            var services = await _testServiceRepository.GetAllAsync();
            return _mapper.Map<List<TestServiceResponse>>(services);
        }

        public async Task<List<TestServiceResponse>> GetByCategoryAsync(string category)
        {
            var services = await _testServiceRepository.GetByCategoryAsync(category);
            return _mapper.Map<List<TestServiceResponse>>(services);
        }

        public async Task<TestServiceResponse> GetByIdAsync(Guid id)
        {
            var service = await _testServiceRepository.GetByIdAsync(id);
            return service == null ? null : _mapper.Map<TestServiceResponse>(service);
        }

        public async Task<TestServiceResponse> UpdateAsync(Guid id, UpdateTestServiceRequest request)
        {
            var existingService = await _testServiceRepository.GetByIdAsync(id);
            if (existingService == null)
                return null;

            _mapper.Map(request, existingService);
            existingService.UpdatedAt = DateTime.UtcNow;

            var updated = await _testServiceRepository.UpdateAsync(existingService);
            return _mapper.Map<TestServiceResponse>(updated);
        }

        public async Task<List<TestServiceAdminResponse>> GetAllForAdminAsync()
        {
            var services = await _testServiceRepository.GetAllForAdminAsync();
            return _mapper.Map<List<TestServiceAdminResponse>>(services);
        }
        
    }
}
