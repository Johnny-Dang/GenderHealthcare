using backend.Application.DTOs.StaffInfoDTO;
using backend.Application.Repositories;
using backend.Application.Services;
using backend.Domain.Entities;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Services
{
    public class StaffInfoService : IStaffInfoService
    {
        private readonly IStaffInfoRepository _staffInfoRepository;
        private readonly IAccountRepository _accountRepository;

        public StaffInfoService(IStaffInfoRepository staffInfoRepository, IAccountRepository accountRepository)
        {
            _staffInfoRepository = staffInfoRepository;
            _accountRepository = accountRepository;
        }

        public async Task<StaffInfoDto?> GetByIdAsync(Guid accountId)
        {
            var staffInfo = await _staffInfoRepository.GetByIdAsync(accountId);
            if (staffInfo == null)
            {
                return null;
            }

            return MapToDto(staffInfo);
        }

        public async Task<IEnumerable<StaffInfoDto>> GetAllAsync()
        {
            var staffInfoList = await _staffInfoRepository.GetAllAsync();
            return staffInfoList.Select(MapToDto);
        }

        public async Task<StaffInfoDto> CreateAsync(CreateStaffInfoRequest request)
        {
            // Check if account exists
            var account = await _staffInfoRepository.GetByIdAsync(request.AccountId);
            if (account == null)
            {
                throw new KeyNotFoundException($"Account with ID {request.AccountId} not found.");
            }

            // Check if staff info already exists
            var exists = await _staffInfoRepository.ExistsAsync(request.AccountId);
            if (exists)
            {
                throw new InvalidOperationException($"Staff information for account ID {request.AccountId} already exists.");
            }

            var staffInfo = new StaffInfo
            {
                AccountId = request.AccountId,
                Department = request.Department,
                Degree = request.Degree,
                YearOfExperience = request.YearOfExperience,
                Biography = request.Biography,
                CreateAt = DateTime.UtcNow
            };

            var createdStaffInfo = await _staffInfoRepository.CreateAsync(staffInfo);
            return MapToDto(createdStaffInfo);
        }

        public async Task<StaffInfoDto?> UpdateAsync(Guid accountId, UpdateStaffInfoRequest request)
        {
            var existingStaffInfo = await _staffInfoRepository.GetByIdAsync(accountId);
            if (existingStaffInfo == null)
            {
                return null;
            }

            existingStaffInfo.Department = request.Department;
            existingStaffInfo.Degree = request.Degree;
            existingStaffInfo.YearOfExperience = request.YearOfExperience;
            existingStaffInfo.Biography = request.Biography;

            var updatedStaffInfo = await _staffInfoRepository.UpdateAsync(existingStaffInfo);
            if (updatedStaffInfo == null)
            {
                return null;
            }

            return MapToDto(updatedStaffInfo);
        }

        public async Task<bool> DeleteAsync(Guid accountId)
        {
            return await _staffInfoRepository.DeleteAsync(accountId);
        }

        private StaffInfoDto MapToDto(StaffInfo staffInfo)
        {
            return new StaffInfoDto
            {
                AccountId = staffInfo.AccountId,
                Department = staffInfo.Department,
                Degree = staffInfo.Degree,
                YearOfExperience = staffInfo.YearOfExperience,
                Biography = staffInfo.Biography,
                CreateAt = staffInfo.CreateAt,
                UpdateAt = staffInfo.UpdateAt,
                Email = staffInfo.Account.Email,
                FullName = $"{staffInfo.Account.FirstName} {staffInfo.Account.LastName}".Trim(),
                Phone = staffInfo.Account.Phone,
                AvatarUrl = staffInfo.Account.avatarUrl
            };
        }
    }
}
