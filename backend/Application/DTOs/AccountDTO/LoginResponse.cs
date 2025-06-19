using System.Text.Json.Serialization;

namespace backend.Application.DTOs.Accounts
{
    public class LoginResponse
    {
        public string AccessToken { get; set; } = default!;
        
        [JsonIgnore] // This will prevent the RefreshToken from being serialized in the response
        public string RefreshToken { get; set; } = default!;
        
        public string Email { get; set; } = default!;
        public string Role { get; set; } = default!;
        public Guid AccountId { get; set; } = default!;
        public string FullName { get; set; } = default!;
    }
}
