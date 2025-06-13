using AutoMapper;
using backend.Application.DTOs.Accounts;
using backend.Application.Interfaces;
using backend.Infrastructure.Database;
using DeployGenderSystem.Application.Helpers;
using DeployGenderSystem.Domain.Entity;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using System.Security.Principal;

namespace backend.Application.Services
{
    public class GoogleCredentialService : IGoogleCredentialService
    {
        private readonly IApplicationDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        public GoogleCredentialService(IApplicationDbContext context,ITokenService tokenService,IMapper mapper,IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _tokenService = tokenService;
            _configuration = configuration;
        }

        public async Task<GoogleJsonWebSignature.Payload> VerifyCredential(string clientId, string credential)
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { clientId }
            };

            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(credential, settings);
                return payload;
            }
            catch (Exception ex)
            {
                //Log the exception or handle it as needed
                throw new InvalidOperationException("Failed to verify Google credential.", ex);
            }
        }

        public async Task<Result<LoginResponse>> LoginGoogleAsync(GoogleLoginDto model)
        {
            // Get the client ID from configuration
            var clientId = _configuration["Authentication:Google:ClientId"];

            // Check if the client ID is configured
            if (string.IsNullOrEmpty(clientId))
            {
                return Result<LoginResponse>.Failure("Google Client ID is not configured in appsettings.json");
            }

            // Verify the Google credential
            var payload = await VerifyCredential(clientId, model.Credential);
            if (payload == null)
            {
                return Result<LoginResponse>.Failure("Login By Google Failed");
            }

            // Get or create account
            var account = await _context.Accounts
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.Email == payload.Email);

            // Delete old refresh token if account exists
            if (account != null)
            {
                _tokenService.DeleteOldRefreshToken(account.User_Id);
            }

            LoginResponse response;

            // If account doesn't exist, register a new one using Google-specific registration
            if (account == null)
            {
                var newAccount = new RegisterRequest
                {
                    Email = payload.Email,
                    AvatarUrl = payload.Picture,
                    FirstName = payload.FamilyName,
                    LastName = payload.GivenName,
                    Password = Guid.NewGuid().ToString(), // Generate a random password
                    Phone = string.Empty,
                    DateOfBirth = null
                };

                var registerResult = await RegisterGoogleAccountAsync(newAccount);
                if (!registerResult.IsSuccess)
                {
                    return Result<LoginResponse>.Failure(registerResult.Error);
                }

                var accessToken = _tokenService.GenerateJwt(registerResult.Data);
                var refreshToken = _tokenService.GenerateRefreshTokenAsync(registerResult.Data.User_Id);

                response = new LoginResponse
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    Email = registerResult.Data.Email,
                    Role = registerResult.Data.RoleName,
                    FullName = $"{payload.FamilyName} {payload.GivenName}",
                    AccountId = registerResult.Data.User_Id,
                };
            }
            else
            {
                var accountDto = _mapper.Map<AccountDto>(account);
                var accessToken = _tokenService.GenerateJwt(accountDto);
                var refreshToken = _tokenService.GenerateRefreshTokenAsync(account.User_Id);

                response = new LoginResponse
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    Email = account.Email,
                    Role = account.Role.Name,
                    FullName = $"{account.FirstName} {account.LastName}",
                    AccountId = account.User_Id,
                };
            }

            return Result<LoginResponse>.Success(response);
        }

        public async Task<Result<AccountDto>> RegisterGoogleAccountAsync(RegisterRequest request)
        {
            var customerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");
            if (customerRole == null)
                return Result<AccountDto>.Failure("Customer role not found. System configuration issue.");

            // Hash password using BCrypt
            var passwordHash = HashHelper.BCriptHash(request.Password);

            // Create account with email already verified (since Google handled verification)
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
                // No need to send verification email - Google account is already verified
            };

            // Save to database
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return Result<AccountDto>.Success(_mapper.Map<AccountDto>(account));
        }
    }
}
