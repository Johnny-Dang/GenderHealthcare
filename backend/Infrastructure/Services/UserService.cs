using backend.Application.DTOs.UserDTO;
using backend.Application.Repositories;
using backend.Application.Services;

namespace backend.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly IAccountRepository _accountRepository;
        public UserService(IAccountRepository accountRepository)
        {
            _accountRepository = accountRepository;
        }
        public async Task<Result<UserResponse>> GetProfileAsync(Guid id)
        {
            var account = await _accountRepository.GetAccountByIdWithRoleAndStaffInfoAsync(id);
            if (account == null)
                return Result<UserResponse>.Failure("User not found");

            var response = new UserResponse
            {
                AccountId = account.AccountId,
                Email = account.Email,
                FirstName = account.FirstName,
                LastName = account.LastName,
                Phone = account.Phone,
                AvatarUrl = account.AvatarUrl,
                DateOfBirth = account.DateOfBirth,
                Gender = account.Gender,
                RoleName = account.Role?.Name ?? "",
                Department = account.StaffInfo?.Department,
                Degree = account.StaffInfo?.Degree,
                YearOfExperience = account.StaffInfo?.YearOfExperience,
                Biography = account.StaffInfo?.Biography
            };

            return Result<UserResponse>.Success(response);
        }

        public async Task<Result<UserResponse>> UpdateProfileAsync(Guid id, UpdateUserProfileRequest request)
        {
            var account = await _accountRepository.GetAccountByIdWithRoleAndStaffInfoAsync(id);
            if (account == null)
                return Result<UserResponse>.Failure("User not found");

            account.FirstName = request.FirstName ?? account.FirstName;
            account.LastName = request.LastName ?? account.LastName;
            account.Phone = request.Phone ?? account.Phone;
            account.AvatarUrl = request.AvatarUrl ?? account.AvatarUrl;
            account.DateOfBirth = request.DateOfBirth ?? account.DateOfBirth;
            if (request.Gender.HasValue)
                account.Gender = request.Gender.Value;

            if (account.StaffInfo != null)
            {
                account.StaffInfo.Department = request.Department ?? account.StaffInfo.Department;
                account.StaffInfo.Degree = request.Degree ?? account.StaffInfo.Degree;
                if (request.YearOfExperience.HasValue)
                    account.StaffInfo.YearOfExperience = request.YearOfExperience.Value;
                account.StaffInfo.Biography = request.Biography ?? account.StaffInfo.Biography;
                account.StaffInfo.UpdateAt = DateTime.UtcNow;
            }

            account.UpdateAt = DateTime.UtcNow;
            await _accountRepository.UpdateAccountAsync(account);

            // Map lại response
            var response = new UserResponse
            {
                AccountId = account.AccountId,
                Email = account.Email,
                FirstName = account.FirstName,
                LastName = account.LastName,
                Phone = account.Phone,
                AvatarUrl = account.AvatarUrl,
                DateOfBirth = account.DateOfBirth,
                Gender = account.Gender,
                RoleName = account.Role?.Name ?? "",
                Department = account.StaffInfo?.Department,
                Degree = account.StaffInfo?.Degree,
                YearOfExperience = account.StaffInfo?.YearOfExperience,
                Biography = account.StaffInfo?.Biography
            };

            return Result<UserResponse>.Success(response);
        }
    }
}
