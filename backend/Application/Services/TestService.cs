using backend.Application.DTOs.ServiceDTO;
using backend.Application.Interfaces;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Services
{
    public class TestService : ITestService
    {
        private readonly IApplicationDbContext _context;
        public TestService(IApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<CreateTestServiceRequest> CreateAsync(CreateTestServiceRequest testDto)
        {
            var testService = new Domain.Entities.TestService
            {
                Id = Guid.NewGuid(),
                ServiceName = testDto.ServiceName,
                Description = testDto.Description,
                Price = testDto.Price,
                Duration = testDto.Duration,
                Category = testDto.Category
            };

            _context.TestService.Add(testService);
            await _context.SaveChangesAsync();

            return testDto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var testService = await _context.TestService.FindAsync(id);

            if (testService == null)
                return false;

            _context.TestService.Remove(testService);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<TestServiceResponse>> GetAllAsync()
        {
            var testServices = await _context.TestService.ToListAsync();

            return testServices.Select(ts => new TestServiceResponse
            {
                Id = ts.Id,
                ServiceName = ts.ServiceName,
                Description = ts.Description,
                Price = ts.Price,
                Duration = ts.Duration,
                Category = ts.Category
            });
        }

        public async Task<TestServiceResponse> GetByIdAsync(Guid id)
        {
            var testService = await _context.TestService.FindAsync(id);

            if (testService == null)
                return null;

            return new TestServiceResponse
            {
                Id = testService.Id,
                ServiceName = testService.ServiceName,
                Description = testService.Description,
                Price = testService.Price,
                Duration = testService.Duration,
                Category = testService.Category
            };
        }

        public async Task<bool> UpdateAsync(Guid id, UpdateTestServiceRequest testDto)
        {
            var testService = await _context.TestService.FindAsync(id);

            if (testService == null)
                return false;

            testService.ServiceName = testDto.ServiceName;
            testService.Description = testDto.Description;
            testService.Price = testDto.Price;
            testService.Duration = testDto.Duration;
            testService.Category = testDto.Category;

            await _context.SaveChangesAsync();

            return true;
        }

    }
}
