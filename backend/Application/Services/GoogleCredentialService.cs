using backend.Application.Interfaces;
using Google.Apis.Auth;

namespace backend.Application.Services
{
    public class GoogleCredentialService : IGoogleCredentialService
    {
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
    }
}
