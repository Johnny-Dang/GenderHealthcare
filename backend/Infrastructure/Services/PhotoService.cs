using backend.Application.Services;
using backend.Domain.AppsettingsConfigurations;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;

namespace backend.Infrastructure.Services
{
    public class PhotoService : IPhotoService
    {
        private readonly Cloudinary _cloudinary;

        public PhotoService(IOptions<CloudinarySettings> config)
        {
            var acc = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );
            _cloudinary = new Cloudinary(acc);
        }

        public async Task<string> UploadPhotoAsync(IFormFile file)
        {
            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Transformation = new Transformation().Crop("fill").Width(500).Height(500)
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
                throw new Exception(uploadResult.Error.Message);

            return uploadResult.SecureUrl.ToString();
        }
    }
}
