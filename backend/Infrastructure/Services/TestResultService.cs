using backend.Application.DTOs.TestResultDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Entities;
using backend.Infrastructure.Repositories;

namespace backend.Infrastructure.Services
{
    public class TestResultService : ITestResultService
    {
        private readonly ITestResultRepository _repository;

        public TestResultService(ITestResultRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<TestResultResponse>> CreateTestResultAsync(CreateTestResultRequest request)
        {
            // Validate booking detail exists
            var bookingDetail = await _repository.GetBookingDetailByIdAsync(request.BookingDetailId);
            if (bookingDetail == null)
            {
                return Result<TestResultResponse>.Failure("Booking detail not found");
            }

            // Create new test result
            var testResult = new TestResult
            {
                ResultId = Guid.NewGuid(),
                BookingDetailId = request.BookingDetailId,
                Result = request.Result,
                Status = request.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Save to database
            await _repository.CreateTestResultAsync(testResult);

            // Return the created test result
            var response = await _repository.GetTestResultByIdAsync(testResult.ResultId);
            if (response == null)
            {
                return Result<TestResultResponse>.Failure("Failed to retrieve created test result");
            }

            return Result<TestResultResponse>.Success(response);
        }

        public async Task<Result<bool>> DeleteTestResultAsync(Guid resultId)
        {
            var result = await _repository.DeleteTestResultAsync(resultId);
            if (!result)
            {
                return Result<bool>.Failure("Test result not found");
            }
            return Result<bool>.Success(true);
        }

        public async Task<Result<List<TestResultResponse>>> GetAllTestResultsAsync()
        {
            var results = await _repository.GetAllTestResultsAsync();
            return Result<List<TestResultResponse>>.Success(results);
        }

        public async Task<Result<TestResultResponse>> GetTestResultByIdAsync(Guid resultId)
        {
            var result = await _repository.GetTestResultByIdAsync(resultId);
            if (result == null)
            {
                return Result<TestResultResponse>.Failure("Test result not found");
            }
            return Result<TestResultResponse>.Success(result);
        }

        public async Task<Result<List<TestResultResponse>>> GetTestResultsByBookingDetailIdAsync(Guid bookingDetailId)
        {
            // Validate booking detail exists
            var bookingDetail = await _repository.GetBookingDetailByIdAsync(bookingDetailId);
            if (bookingDetail == null)
            {
                return Result<List<TestResultResponse>>.Failure("Booking detail not found");
            }

            var results = await _repository.GetTestResultsByBookingDetailIdAsync(bookingDetailId);
            return Result<List<TestResultResponse>>.Success(results);
        }

        public async Task<Result<TestResultResponse>> UpdateTestResultAsync(Guid resultId, UpdateTestResultRequest request)
        {
            // Validate test result exists
            var testResult = await _repository.GetTestResultEntityByIdAsync(resultId);
            if (testResult == null)
            {
                return Result<TestResultResponse>.Failure("Test result not found");
            }

            // Update properties
            if (request.Result != null)
            {
                testResult.Result = request.Result;
            }
            
            testResult.Status = request.Status;
            testResult.UpdatedAt = DateTime.UtcNow;

            // Save changes
            await _repository.UpdateTestResultAsync(testResult);

            // Return updated result
            var updatedResult = await _repository.GetTestResultByIdAsync(resultId);
            if (updatedResult == null)
            {
                return Result<TestResultResponse>.Failure("Failed to retrieve updated test result");
            }

            return Result<TestResultResponse>.Success(updatedResult);
        }

        public async Task<Result<List<TestResultResponse>>> GetTestResultsByPhoneAsync(string phone)
        {
            var testResults = await _repository.GetTestResultsByPhoneAsync(phone);

            if (!testResults.Any())
                return Result<List<TestResultResponse>>.Failure("No test results found for this phone number");

            var response = testResults.Select(tr => new TestResultResponse
            {
                ResultId = tr.ResultId,
                BookingDetailId = tr.BookingDetailId,
                Result = tr.Result,
                Status = tr.Status,
                CreatedAt = tr.CreatedAt,
                UpdatedAt = tr.UpdatedAt,
                CustomerName = $"{tr.BookingDetail.FirstName} {tr.BookingDetail.LastName}".Trim(),
                ServiceName = tr.BookingDetail.TestService?.ServiceName
            }).ToList();

            return Result<List<TestResultResponse>>.Success(response);
        }
    }
}
