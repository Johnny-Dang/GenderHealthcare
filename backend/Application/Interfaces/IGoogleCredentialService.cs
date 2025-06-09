using backend.Application.DTOs.Accounts;
using Google.Apis.Auth;

namespace backend.Application.Interfaces
{
    public interface IGoogleCredentialService
    {
        public Task<GoogleJsonWebSignature.Payload> VerifyCredential(string clientId, string credential);

        public Task<LoginResponse> LoginGoogleAsync(GoogleJsonWebSignature.Payload userGoogle);
    }
}
