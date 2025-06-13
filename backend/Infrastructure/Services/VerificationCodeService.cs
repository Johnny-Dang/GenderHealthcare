using System;
using System.Security.Cryptography;
using backend.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Infrastructure.Services
{
    public class VerificationCodeService : IVerificationCodeService
    {
        private readonly IEmailService _emailService;
        private readonly IMemoryCache _cache;
        private readonly TimeSpan _expirationTime = TimeSpan.FromMinutes(10);

        public VerificationCodeService(IEmailService emailService, IMemoryCache cache)
        {
            _emailService = emailService;
            _cache = cache;
        }

        public string GenerateVerificationCode(string email)
        {
            var code = GenerateRandomCode();
            var cacheKey = GetCacheKey(email);
            _cache.Set(cacheKey, code, _expirationTime);

            _emailService.SendVerificationEmailAsync(email, code).Wait();
            return code;
        }

        public bool VerifyCode(string email, string code)
        {
            var cacheKey = GetCacheKey(email);
            if (_cache.TryGetValue(cacheKey, out string storedCode))
            {
                var isValid = storedCode.Trim().Equals(code.Trim(), StringComparison.OrdinalIgnoreCase);
                if (isValid)
                {
                    _cache.Remove(cacheKey);
                }
                return isValid;
            }
            return false;
        }

        public void RemoveCode(string email)
        {
            var cacheKey = GetCacheKey(email);
            _cache.Remove(cacheKey);
        }

        private string GenerateRandomCode()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[4];
            rng.GetBytes(bytes);
            var value = BitConverter.ToUInt32(bytes, 0) % 1000000;
            return value.ToString("D6");
        }

        private string GetCacheKey(string email)
        {
            return $"VerificationCode_{email.ToLower()}";
        }
    }
} 