using backend.Application.DTOs.UserDTO;

namespace backend.Application.Services
{
    public interface IUserService
    {
        Task<Result<UserResponse>> GetProfileAsync(Guid id);
        Task<Result<UserResponse>> UpdateProfileAsync(Guid id, UpdateUserProfileRequest request);
    }
}
