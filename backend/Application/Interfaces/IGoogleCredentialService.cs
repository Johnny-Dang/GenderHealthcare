using Google.Apis.Auth;

namespace backend.Application.Interfaces
{
    public interface IGoogleCredentialService
    {
        public Task<GoogleJsonWebSignature.Payload> VerifyCredential(string clientId, string credential);
    }
}
