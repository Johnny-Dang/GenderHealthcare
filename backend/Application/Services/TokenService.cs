//using backend.Application.Interfaces;
//using DeployGenderSystem.Domain.Entity;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.IdentityModel.Tokens;
//using System.IdentityModel.Tokens.Jwt;
//using System.Security.Claims;
//using System.Text;

//namespace backend.Application.Services
//{
//    public class TokenService : ITokenService
//    {
//        private readonly IApplicationDbContext _context;
//        //private readonly JwtSettings _jwtSettings;
//        public TokenService(IApplicationDbContext context)
//        {
//            _context = context;
//        }

//        public async void DeleteOldRefreshToken(Guid accountId)
//        {
//            var entity = _context.RefreshTokens.Where(x => x.AccountId == accountId).ToList();

//            if (entity == null)
//            {
//                return;
//            }
//             _context.RefreshTokens.RemoveRange(entity);
//             await _context.SaveChangesAsync();
//        }

//        public string GenerateJwt(Account user)
//        {
//            var claims = new List<Claim>
//            {
//                new (ClaimTypes.NameIdentifier, user.User_Id.ToString()),
//                new (ClaimTypes.Email, user.Email),
//                new (ClaimTypes.Role, user.Role.ToString()),
//            };

//            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));


//            var token = new JwtSecurityToken(
//                issuer: _jwtSettings.Issuer,
//                audience: _jwtSettings.Audience,
//                claims: claims,
//                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
//                signingCredentials: new SigningCredentials(
//                    key,
//                    SecurityAlgorithms.HmacSha256Signature
//                    )
//                );

//            return new JwtSecurityTokenHandler().WriteToken(token);
//        }

//        public string GenerateRefreshToken(Guid accountId)
//        {
//            throw new NotImplementedException();
//        }

//        public Account GetUserByRefreshToken(string refreshToken)
//        {
//            throw new NotImplementedException();
//        }
//    }
//}
