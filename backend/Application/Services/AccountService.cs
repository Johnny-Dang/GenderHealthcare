using AutoMapper;
using backend.Application.DTOs.Accounts;
using backend.Application.Interfaces;
using backend.Application.Services;
using backend.Domain.AppsettingsConfigurations;
using backend.Domain.Entities;
using backend.Infrastructure.Database;

//using backend.Infrastructure.Services;
using DeployGenderSystem.Application.Helpers;
using DeployGenderSystem.Domain.Entity;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.UserSecrets;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Application.Services
{
    public class AccountService : IAccountService
    {
        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ITokenService _tokenService;
        private readonly IVerificationCodeService _verificationCodeService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly IGoogleCredentialService _googleCredentialService;
        public AccountService(IApplicationDbContext context, IMapper mapper, ITokenService tokenService, IVerificationCodeService verificationCodeService, IEmailService emailService, IGoogleCredentialService googleCredentialService, IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _tokenService = tokenService;
            _verificationCodeService = verificationCodeService;
            _emailService = emailService;
            _googleCredentialService = googleCredentialService;
            _configuration = configuration;
        }

        public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request)
        {
            var user = await _context.Accounts
                .Include(r => r.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                return Result<LoginResponse>.Failure("Email không tồn tại.");

            var password = request.Password;

            var isValid = HashHelper.BCriptVerify(password, user.Password);
            if (!isValid)
                return Result<LoginResponse>.Failure("Mật khẩu không đúng.");
            
            var accountDto = _mapper.Map<AccountDto>(user);
            var accessToken = _tokenService.GenerateJwt(accountDto);
            var refreshToken = _tokenService.GenerateRefreshTokenAsync(user.User_Id);

            var response = new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                Email = user.Email,
                Role = user.Role.Name,
                AccountId = user.User_Id,
                FullName = user.FirstName + " " + user.LastName
            };

            return Result<LoginResponse>.Success(response);
        }

        public async Task<Result<AccountDto>> CreateAsync(CreateAccountRequest request)
        {
            if (await _context.Accounts.AnyAsync(a => a.Email == request.Email))
                return Result<AccountDto>.Failure("Email already exists.");

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.RoleName);
            if (role == null) return Result<AccountDto>.Failure("Role not found.");

            var password = HashHelper.BCriptHash(request.Password);

            var account = new Account
            {
                User_Id = Guid.NewGuid(),
                Email = request.Email,
                Password = password,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                avatarUrl = request.AvatarUrl,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                RoleId = role.Id,
                CreateAt = DateTime.UtcNow
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return Result<AccountDto>.Success(_mapper.Map<AccountDto>(account));
        }

        public async Task<Result<AccountDto>> GetByIdAsync(Guid id)
        {
            var acc = await _context.Accounts.Include(a => a.Role).FirstOrDefaultAsync(a => a.User_Id == id);
            if (acc == null) return Result<AccountDto>.Failure("Not found");
            return Result<AccountDto>.Success(_mapper.Map<AccountDto>(acc));
        }

        public async Task<Result<List<AccountDto>>> GetAllAsync()
        {
            var accounts = await _context.Accounts.Include(a => a.Role).Where(x => x.Role.Name != "Admin").ToListAsync();
            return Result<List<AccountDto>>.Success(_mapper.Map<List<AccountDto>>(accounts));
        }

        public async Task<Result<AccountDto>> UpdateAsync(Guid id, UpdateAccountRequest request)
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.User_Id == id);
            if (account == null) return Result<AccountDto>.Failure("Not found");

            account.FirstName = request.FirstName ?? account.FirstName;
            account.LastName = request.LastName ?? account.LastName;
            account.Phone = request.Phone ?? account.Phone;
            account.avatarUrl = request.AvatarUrl ?? account.avatarUrl;
            account.DateOfBirth = request.DateOfBirth ?? account.DateOfBirth;
            account.Gender = request.Gender;

            if (!string.IsNullOrEmpty(request.RoleName))
            {
                var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.RoleName);
                if (role != null) account.RoleId = role.Id;
            }

            account.UpdateAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Result<AccountDto>.Success(_mapper.Map<AccountDto>(account));
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var acc = await _context.Accounts.FindAsync(id);
            if (acc == null) return Result<bool>.Failure("Not found");
            _context.Accounts.Remove(acc);
            await _context.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        public async Task<Result<AccountDto>> GetAccountByEmail(string email)
        {
            var account = await _context.Accounts
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.Email == email);
            if (account == null) return Result<AccountDto>.Failure("Account not found.");
            var accountDto = _mapper.Map<AccountDto>(account);

            return Result<AccountDto>.Success(accountDto);
        }

        public async Task<Result<bool>> SendForgotPasswordCodeAsync(SendVerificationCodeRequest request)
        {
            bool emailExists = await _context.Accounts.AnyAsync(a => a.Email == request.Email);
            if (!emailExists)
                return Result<bool>.Failure("Email không tồn tại.");

            var verificationCode = _verificationCodeService.GenerateVerificationCode(request.Email);
            var emailSent = await _emailService.SendVerificationEmailAsync(request.Email, verificationCode);

            if (!emailSent)
                return Result<bool>.Failure("Không thể gửi mã xác thực. Vui lòng thử lại sau.");

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var isValid = _verificationCodeService.VerifyCode(request.Email, request.VerificationCode);
            if (!isValid)
                return Result<bool>.Failure("Mã xác thực không hợp lệ hoặc đã hết hạn.");

            var user = await _context.Accounts.FirstOrDefaultAsync(a => a.Email == request.Email);
            if (user == null)
                return Result<bool>.Failure("Email không tồn tại.");

            user.Password = HashHelper.BCriptHash(request.NewPassword);
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> SendVerificationCodeAsync(SendVerificationCodeRequest request)
        {
            var verificationCode = _verificationCodeService.GenerateVerificationCode(request.Email);
            var emailSent = await _emailService.SendVerificationEmailAsync(request.Email, verificationCode);
            if (!emailSent)
                return Result<bool>.Failure("Không thể gửi mã xác thực. Vui lòng thử lại sau.");
            return Result<bool>.Success(true);
        }

        public async Task<Result<AccountDto>> RegisterWithVerificationCodeAsync(RegisterWithVerificationCodeRequest request)
        {
            // Kiểm tra mã xác thực
            var isValid = _verificationCodeService.VerifyCode(request.Email, request.VerificationCode);
            if (!isValid)
                return Result<AccountDto>.Failure("Mã xác thực không hợp lệ hoặc đã hết hạn.");

            // Kiểm tra email đã tồn tại
            bool emailExists = await _context.Accounts.AnyAsync(a => a.Email == request.Email);
            if (emailExists)
                return Result<AccountDto>.Failure("Email already exists.");

            var customerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");
            var passwordHash = HashHelper.BCriptHash(request.Password);

            var account = new Account
            {
                User_Id = Guid.NewGuid(),
                Email = request.Email,
                Password = passwordHash,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                avatarUrl = request.AvatarUrl,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                RoleId = customerRole.Id,
                CreateAt = DateTime.UtcNow
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            // Xóa mã xác thực khỏi cache sau khi đăng ký thành công
            _verificationCodeService.RemoveCode(request.Email);

            return Result<AccountDto>.Success(_mapper.Map<AccountDto>(account));
        }

        public async Task<Result<LoginResponse>> RefreshTokenAsync(string refreshToken)
        {
            var user = _tokenService.GetUserByRefreshToken(refreshToken);
            if (user == null)
            {
                return Result<LoginResponse>.Failure("Refresh token is not found or invalid");
            }
            
            // Delete old refresh token
            _tokenService.DeleteOldRefreshToken(user.User_Id);
            
            // Generate new access token and refresh token
            var accessToken = _tokenService.GenerateJwt(user);
            var newRefreshToken = _tokenService.GenerateRefreshTokenAsync(user.User_Id);
            
            var response = new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = newRefreshToken,
                Email = user.Email,
                Role = user.RoleName,
                AccountId = user.User_Id,
                FullName = user.FirstName + " " + user.LastName
            };
            
            return Result<LoginResponse>.Success(response);
        }

        public async Task<Result<bool>> LogoutAsync(Guid accountId)
        {
            _tokenService.DeleteOldRefreshToken(accountId);
            return Result<bool>.Success(true);
        }
    }

}
