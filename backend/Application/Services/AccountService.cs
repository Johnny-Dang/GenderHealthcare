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
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public AccountService(
            IApplicationDbContext context, 
            IMapper mapper, 
            ITokenService tokenService,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _tokenService = tokenService;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<Result<AccountDto>> RegisterAsync(RegisterRequest request)
        {
            // Check if email already exists
            bool emailExists = await _context.Accounts.AnyAsync(a => a.Email == request.Email);
            if (emailExists)
                return Result<AccountDto>.Failure("Email already exists.");

            var customerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");
            if (customerRole == null)
                return Result<AccountDto>.Failure("Customer role not found. System configuration issue.");

            // Hash password using BCrypt
            var passwordHash = HashHelper.BCriptHash(request.Password);

            // Create account with IsEmailVerified = false
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
                CreateAt = DateTime.UtcNow,
                IsEmailVerified = false // Set to false by default
            };

            // Save to database
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            // Create verification token
            string secretKey = _configuration["EmailVerification:SecretKey"];
            int tokenExpirationMinutes = int.Parse(_configuration["EmailVerification:TokenExpirationMinutes"] ?? "10");
            string verificationToken = EmailVerificationHelper.GenerateEmailVerificationToken(account.Email, secretKey, tokenExpirationMinutes);

            // Send verification email
            await _emailService.SendVerificationEmailAsync(account.Email, verificationToken);

            return Result<AccountDto>.Success(_mapper.Map<AccountDto>(account));
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

            // Check if email is verified
            if (!user.IsEmailVerified)
                return Result<LoginResponse>.Failure("Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hộp thư của bạn.");

            var accountDto = _mapper.Map<AccountDto>(user);

            var response = new LoginResponse
            {
                AccessToken = _tokenService.GenerateJwt(accountDto),
                Email = user.Email,
                Role = user.Role.Name,
                AccountId = user.User_Id
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

        public async Task<Result<bool>> VerifyEmailAsync(string token)
        {
            string secretKey = _configuration["EmailVerification:SecretKey"];
            string email = EmailVerificationHelper.ValidateEmailVerificationToken(token, secretKey);
            
            if (email == null)
                return Result<bool>.Failure("Invalid or expired verification token.");

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Email == email);
            if (account == null)
                return Result<bool>.Failure("Account not found.");

            if (account.IsEmailVerified)
                return Result<bool>.Success(true); // Already verified, return success

            // Update verification status
            account.IsEmailVerified = true;
            account.UpdateAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Result<bool>.Success(true);
        }
    }
}
