using AutoMapper;
using backend.Application.DTOs.Accounts;
using backend.Application.Interfaces;
using backend.Infrastructure.Database;
using DeployGenderSystem.Domain.Entity;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using System.Security.Principal;

namespace backend.Application.Services
{
    public class GoogleCredentialService : IGoogleCredentialService
    {
        private readonly IApplicationDbContext _context;
        private readonly IAccountService _accountService;
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;
        public GoogleCredentialService(IApplicationDbContext context, IAccountService accountService,ITokenService tokenService,IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
            _tokenService = tokenService;
            _accountService = accountService;
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

        public async Task<LoginResponse> LoginGoogleAsync(GoogleJsonWebSignature.Payload userGoogle)
        {
            var account = await _context.Accounts
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.Email == userGoogle.Email);
            _tokenService.DeleteOldRefreshToken(account.User_Id);

            var accessToken = string.Empty;
            var registerResult = new Result<AccountDto>();
            var response = new LoginResponse();
            if (account == null)
            {
              var newAccount = new RegisterRequest
                {
                    Email = userGoogle.Email,
                    AvatarUrl = userGoogle.Picture,
                    FirstName = userGoogle.FamilyName,
                    LastName = userGoogle.GivenName,
                    Password = Guid.NewGuid().ToString(), // Generate a random password
                    Phone = string.Empty,
                    DateOfBirth = null
                };

                registerResult = await _accountService.RegisterAsync(newAccount);
                accessToken = _tokenService.GenerateJwt(registerResult.Data);
                response = new LoginResponse
                {
                    AccessToken = accessToken,
                    Email = registerResult.Data.Email,
                    Role = registerResult.Data.RoleName, // Assuming default role for new users
                    FullName = $"{userGoogle.FamilyName} {userGoogle.GivenName}",
                    AccountId = registerResult.Data.User_Id,
                };
            }
            else
            {
                accessToken = _tokenService.GenerateJwt(_mapper.Map<AccountDto>(account));
                response = new LoginResponse
                {
                    AccessToken = accessToken,
                    Email = account.Email,
                    Role = account.Role.Name, // Assuming Role is an entity with a Name property
                    FullName = $"{account.FirstName} {account.LastName}",
                    AccountId = account.User_Id,
                };
            }


            return response;
        }
    }
}
