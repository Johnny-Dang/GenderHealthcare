using backend.Application.DTOs.TestResultDTO;
using backend.Domain.Entities;

namespace backend.Application.Repositories
{
    public interface ITestResultRepository
    {
        Task<List<TestResultResponse>> GetAllTestResultsAsync();
        Task<TestResultResponse?> GetTestResultByIdAsync(Guid resultId);
        Task<List<TestResultResponse>> GetTestResultsByBookingDetailIdAsync(Guid bookingDetailId);
        Task<TestResult> CreateTestResultAsync(TestResult testResult);
        Task<bool> UpdateTestResultAsync(TestResult testResult);
        Task<bool> DeleteTestResultAsync(Guid resultId);
        Task<TestResult?> GetTestResultEntityByIdAsync(Guid resultId);
        Task<BookingDetail?> GetBookingDetailByIdAsync(Guid bookingDetailId);
    }
}
