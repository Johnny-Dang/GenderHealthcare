using backend.Application.DTOs.TestResultDTO;

namespace backend.Application.Services
{
    public interface ITestResultService
    {
        Task<Result<List<TestResultResponse>>> GetAllTestResultsAsync();
        Task<Result<TestResultResponse>> GetTestResultByIdAsync(Guid resultId);
        Task<Result<List<TestResultResponse>>> GetTestResultsByBookingDetailIdAsync(Guid bookingDetailId);
        Task<Result<TestResultResponse>> CreateTestResultAsync(CreateTestResultRequest request);
        Task<Result<TestResultResponse>> UpdateTestResultAsync(Guid resultId, UpdateTestResultRequest request);
        Task<Result<bool>> DeleteTestResultAsync(Guid resultId);
    }
}
