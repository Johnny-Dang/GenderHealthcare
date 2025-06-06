using AutoMapper;
using backend.Application.DTOs.Accounts;
using backend.Application.Interfaces;
using backend.Infrastructure.Services;
using DeployGenderSystem.Application.Helpers;
using DeployGenderSystem.Domain.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration.UserSecrets;
using Microsoft.Extensions.Options;

namespace backend.Application.Services
{
    public class AccountService : IAccountService
    {

        private readonly IApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly JwtTokenGenerator _tokenGenerator;

        public AccountService(IApplicationDbContext context, IMapper mapper, IConfiguration config, JwtTokenGenerator tokenGenerator)
        {
            _context = context;
            _mapper = mapper;
            _tokenGenerator = tokenGenerator;
        }
        //public string GenerateJwt(Account user)
        //{
        //    throw new NotImplementedException();
        //}

        public async Task<Result<AccountDto>> RegisterAsync(CreateAccountRequest request)
        {
            // Kiểm tra email đã tồn tại
            bool emailExists = await _context.Accounts.AnyAsync(a => a.Email == request.Email);
            if (emailExists)
                return Result<AccountDto>.Failure("Email already exists.");

            var customerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");
            // Băm mật khẩu với salt bằng BCrypt
            //var salt = BCrypt.Net.BCrypt.GenerateSalt();
            var passwordHash = HashHelper.BCriptHash(request.Password);

            // Tạo thực thể Account
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

            // Lưu vào database
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            // Tải lại account kèm Role để mapping đầy đủ DTO
            var savedAccount = await _context.Accounts
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.User_Id == account.User_Id);

            // Map sang DTO và trả kết quả
            var dto = _mapper.Map<AccountDto>(savedAccount);
            return Result<AccountDto>.Success(dto);
        }


        //public Account? LoginAccount(LoginAccountModel user)
        //{
        //    throw new NotImplementedException();
        //}

        //public Guid RegisterAccount(CreateAccountRequest userModel)
        //{
        //    var user = _context.User.Any(x => x.Email == userModel.Email);
        //    if (user) return Guid.Empty;
        //    var result = _mapper.Map<Account>(userModel);

        //    var salting = HashHelper.GenerateRamdomString(100);
        //    var password = userModel.PasswordHash + salting;

        //    result.Salting = salting;
        //    result.PasswordHash = HashHelper.BCriptHash(password);

        //    _context.User.Add(result);

        //    await _context.SaveChangesAsync();

        //    return result.User_Id;
        //}
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

            //var tokenService = new JwtTokenGenerator(_config);
            var response = _tokenGenerator.GenerateToken(user);

            return Result<LoginResponse>.Success(response);
        }

    }
}
