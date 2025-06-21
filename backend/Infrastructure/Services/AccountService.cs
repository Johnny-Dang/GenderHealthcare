using AutoMapper;
using backend.Application.DTOs.AccountDTO;
using backend.Application.DTOs.Accounts;
using backend.Application.Interfaces;
using backend.Application.Repositories;
using DeployGenderSystem.Application.Helpers;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;

namespace backend.Infrastructure.Services
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IMapper _mapper;
        private readonly ITokenService _tokenService;
        private readonly IVerificationCodeService _verificationCodeService;
        private readonly IEmailService _emailService;
        
        public AccountService(
            IAccountRepository accountRepository, 
            IMapper mapper, 
            ITokenService tokenService, 
            IVerificationCodeService verificationCodeService, 
            IEmailService emailService)
        {
            _accountRepository = accountRepository;
            _mapper = mapper;
            _tokenService = tokenService;
            _verificationCodeService = verificationCodeService;
            _emailService = emailService;
        }

        public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request)
        {
            var user = await _accountRepository.GetAccountByEmailWithRoleAsync(request.Email);

            if (user == null)
                return Result<LoginResponse>.Failure("Email không tồn tại.");

            var password = request.Password;

            var isValid = HashHelper.BCriptVerify(password, user.Password);
            if (!isValid)
                return Result<LoginResponse>.Failure("Mật khẩu không đúng.");
            
            var accountDto = _mapper.Map<AccountDto>(user);
            var accessToken = _tokenService.GenerateJwt(accountDto);
            await _tokenService.DeleteOldRefreshToken(user.AccountId);
            var refreshToken = await _tokenService.GenerateRefreshTokenAsync(user.AccountId);

            var response = new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                Email = user.Email,
                Role = user.Role.Name,
                AccountId = user.AccountId,
                FullName = user.FirstName + " " + user.LastName
            };

            return Result<LoginResponse>.Success(response);
        }

        public async Task<Result<AccountDto>> CreateAsync(CreateAccountRequest request)
        {
            if (await _accountRepository.EmailExistsAsync(request.Email))
                return Result<AccountDto>.Failure("Email already exists.");

            var role = await _accountRepository.GetRoleByNameAsync(request.RoleName);
            if (role == null) return Result<AccountDto>.Failure("Role not found.");

            var password = HashHelper.BCriptHash(request.Password);

            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                Email = request.Email,
                Password = password,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                avatarUrl = request.AvatarUrl,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                RoleId = role.RoleId,
                CreateAt = DateTime.UtcNow
            };

            await _accountRepository.CreateAccountAsync(account);

            return Result<AccountDto>.Success(_mapper.Map<AccountDto>(account));
        }

        

        public async Task<Result<AccountDto>> GetByIdAsync(Guid id)
        {
            var acc = await _accountRepository.GetAccountByIdWithRoleAsync(id);
            if (acc == null) return Result<AccountDto>.Failure("Not found");
            return Result<AccountDto>.Success(_mapper.Map<AccountDto>(acc));
        }
        
        // Fix lại nè
        public async Task<Result<List<AccountResponse>>> GetAllAsync()
        {
            var accounts = await _accountRepository.GetAllAccountsAsync();

            var result = accounts.Select(acc => new AccountResponse
            {
                AccountId = acc.AccountId,
                Email = acc.Email,
                Phone = acc.Phone,
                AvatarUrl = acc.avatarUrl,
                DateOfBirth = acc.DateOfBirth,
                Gender = acc.Gender,
                CreateAt = acc.CreateAt,
                FullName = $"{acc.FirstName} {acc.LastName}".Trim(),
                IsDeleted = acc.IsDeleted,
                RoleName = acc.Role != null ? acc.Role.Name : string.Empty
                
            }).ToList();

            return Result<List<AccountResponse>>.Success(result);
        }

        public async Task<Result<AccountDto>> UpdateAsync(Guid id, UpdateAccountRequest request)
        {
            var account = await _accountRepository.GetAccountByIdAsync(id);
            if (account == null) return Result<AccountDto>.Failure("Not found");

            account.FirstName = request.FirstName ?? account.FirstName;
            account.LastName = request.LastName ?? account.LastName;
            account.Phone = request.Phone ?? account.Phone;
            account.avatarUrl = request.AvatarUrl ?? account.avatarUrl;
            account.DateOfBirth = request.DateOfBirth ?? account.DateOfBirth;
            account.Gender = request.Gender;

            if (!string.IsNullOrEmpty(request.RoleName))
            {
                var role = await _accountRepository.GetRoleByNameAsync(request.RoleName);
                if (role != null) account.RoleId = role.RoleId;
            }

            account.UpdateAt = DateTime.UtcNow;
            await _accountRepository.UpdateAccountAsync(account);
            return Result<AccountDto>.Success(_mapper.Map<AccountDto>(account));
        }

        public async Task<Result<bool>> DeleteAsync(Guid id)
        {
            var success = await _accountRepository.DeleteAccountAsync(id);
            if (!success) return Result<bool>.Failure("Not found");
            return Result<bool>.Success(true);
        }

        public async Task<Result<AccountDto>> GetAccountByEmail(string email)
        {
            var account = await _accountRepository.GetAccountByEmailWithRoleAsync(email);
            if (account == null) return Result<AccountDto>.Failure("Account not found.");
            var accountDto = _mapper.Map<AccountDto>(account);

            return Result<AccountDto>.Success(accountDto);
        }

        public async Task<Result<bool>> SendForgotPasswordCodeAsync(SendVerificationCodeRequest request)
        {
            bool emailExists = await _accountRepository.EmailExistsAsync(request.Email);
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

            var user = await _accountRepository.GetAccountByEmailAsync(request.Email);
            if (user == null)
                return Result<bool>.Failure("Email không tồn tại.");

            user.Password = HashHelper.BCriptHash(request.NewPassword);
            await _accountRepository.UpdateAccountAsync(user);

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
            bool emailExists = await _accountRepository.EmailExistsAsync(request.Email);
            if (emailExists)
                return Result<AccountDto>.Failure("Email already exists.");

            var customerRole = await _accountRepository.GetRoleByNameAsync("Customer");
            var passwordHash = HashHelper.BCriptHash(request.Password);

            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                Email = request.Email,
                Password = passwordHash,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                avatarUrl = request.AvatarUrl,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                RoleId = customerRole.RoleId,
                CreateAt = DateTime.UtcNow
            };

            await _accountRepository.CreateAccountAsync(account);

            // Xóa mã xác thực khỏi cache sau khi đăng ký thành công
            _verificationCodeService.RemoveCode(request.Email);

            return Result<AccountDto>.Success(_mapper.Map<AccountDto>(account));
        }

        public async Task<Result<LoginResponse>> RefreshTokenAsync(string refreshToken)
        {
            var user = await _tokenService.GetUserByRefreshToken(refreshToken);
            if (user == null)
            {
                return Result<LoginResponse>.Failure("Refresh token is not found or invalid");
            }
            
            // Delete old refresh token
            await _tokenService.DeleteOldRefreshToken(user.User_Id);
            
            // Generate new access token and refresh token
            var accessToken = _tokenService.GenerateJwt(user);
            var newRefreshToken = await _tokenService.GenerateRefreshTokenAsync(user.User_Id);
            
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
            // Get the JWT token from the Authorization header
            var authHeader = System.Threading.Thread.CurrentPrincipal?.Identity as System.Security.Claims.ClaimsIdentity;
            var jwtToken = authHeader?.FindFirst("access_token")?.Value;

            if (!string.IsNullOrEmpty(jwtToken))
            {
                try
                {
                    // Read the token to get its expiration time
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var token = tokenHandler.ReadJwtToken(jwtToken);
                    var expiry = token.ValidTo;

                    // Add the token to the blacklist
                    _tokenService.BlacklistToken(jwtToken, expiry);
                }
                catch
                {
                    // If we can't read the token, just continue with refresh token deletion
                }
            }

            // Delete refresh tokens
            await _tokenService.DeleteOldRefreshToken(accountId);
            return Result<bool>.Success(true);
        }
    }
}
