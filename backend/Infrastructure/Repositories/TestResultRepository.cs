using backend.Application.DTOs.TestResultDTO;
using backend.Application.Repositories;
using backend.Domain.Entities;
using backend.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories
{
    public class TestResultRepository : ITestResultRepository
    {
        private readonly IApplicationDbContext _context;

        public TestResultRepository(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TestResult> CreateTestResultAsync(TestResult testResult)
        {
            _context.TestResult.Add(testResult);
            await _context.SaveChangesAsync();
            return testResult;
        }

        public async Task<bool> DeleteTestResultAsync(Guid resultId)
        {
            var testResult = await _context.TestResult.FindAsync(resultId);
            if (testResult == null)
                return false;

            _context.TestResult.Remove(testResult);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TestResultResponse>> GetAllTestResultsAsync()
        {
            return await _context.TestResult
                .Include(tr => tr.BookingDetail)
                .ThenInclude(bd => bd.TestService)
                .Select(tr => new TestResultResponse
                {
                    ResultId = tr.ResultId,
                    BookingDetailId = tr.BookingDetailId,
                    Result = tr.Result,
                    Status = tr.Status,
                    CreatedAt = tr.CreatedAt,
                    UpdatedAt = tr.UpdatedAt,
                    CustomerName = $"{tr.BookingDetail.FirstName} {tr.BookingDetail.LastName}",
                    ServiceName = tr.BookingDetail.TestService.ServiceName
                })
                .ToListAsync();
        }

        public async Task<BookingDetail?> GetBookingDetailByIdAsync(Guid bookingDetailId)
        {
            return await _context.BookingDetail
                .Include(bd => bd.TestService)
                .FirstOrDefaultAsync(bd => bd.BookingDetailId == bookingDetailId);
        }

        public async Task<TestResult?> GetTestResultEntityByIdAsync(Guid resultId)
        {
            return await _context.TestResult.FindAsync(resultId);
        }

        public async Task<TestResultResponse?> GetTestResultByIdAsync(Guid resultId)
        {
            return await _context.TestResult
                .Include(tr => tr.BookingDetail)
                .ThenInclude(bd => bd.TestService)
                .Where(tr => tr.ResultId == resultId)
                .Select(tr => new TestResultResponse
                {
                    ResultId = tr.ResultId,
                    BookingDetailId = tr.BookingDetailId,
                    Result = tr.Result,
                    Status = tr.Status,
                    CreatedAt = tr.CreatedAt,
                    UpdatedAt = tr.UpdatedAt,
                    CustomerName = $"{tr.BookingDetail.FirstName} {tr.BookingDetail.LastName}",
                    ServiceName = tr.BookingDetail.TestService.ServiceName
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<TestResultResponse>> GetTestResultsByBookingDetailIdAsync(Guid bookingDetailId)
        {
            return await _context.TestResult
                .Include(tr => tr.BookingDetail)
                .ThenInclude(bd => bd.TestService)
                .Where(tr => tr.BookingDetailId == bookingDetailId)
                .Select(tr => new TestResultResponse
                {
                    ResultId = tr.ResultId,
                    BookingDetailId = tr.BookingDetailId,
                    Result = tr.Result,
                    Status = tr.Status,
                    CreatedAt = tr.CreatedAt,
                    UpdatedAt = tr.UpdatedAt,
                    CustomerName = $"{tr.BookingDetail.FirstName} {tr.BookingDetail.LastName}",
                    ServiceName = tr.BookingDetail.TestService.ServiceName
                })
                .ToListAsync();
        }

        public async Task<bool> UpdateTestResultAsync(TestResult testResult)
        {
            _context.TestResult.Update(testResult);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TestResult>> GetTestResultsByPhoneAsync(string phone)
        {
            return await _context.TestResult
                .Include(tr => tr.BookingDetail)
                    .ThenInclude(bd => bd.TestService)
                .Where(tr => tr.BookingDetail.Phone == phone)
                .OrderByDescending(tr => tr.CreatedAt)
                .ToListAsync();
        }
    }
}
