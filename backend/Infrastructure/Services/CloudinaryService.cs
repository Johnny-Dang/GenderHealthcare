using backend.Application.Services;
using backend.Domain.AppsettingsConfigurations;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace backend.Infrastructure.Services
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IOptions<CloudinarySettings> options)
        {
            var settings = options.Value;
            if (string.IsNullOrWhiteSpace(settings.CloudName) ||
                string.IsNullOrWhiteSpace(settings.ApiKey) ||
                string.IsNullOrWhiteSpace(settings.ApiSecret))
            {
                throw new InvalidOperationException("Cloudinary configuration is incomplete.");
            }
            var account = new Account(
                settings.CloudName,
                settings.ApiKey,
                settings.ApiSecret);
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadPdfAsync(IFormFile file, string folder)
        {
            if (string.IsNullOrWhiteSpace(folder))
                throw new ArgumentException("Folder không được để trống.");
            
            if (file == null || file.Length == 0 || !file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("File không hợp lệ. Chỉ nhận PDF.");

            // Validate MIME type for security
            if (file.ContentType != "application/pdf")
                throw new ArgumentException("File không hợp lệ. MIME type phải là application/pdf.");

            using var stream = file.OpenReadStream();
            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                return uploadResult.SecureUrl.ToString();
            throw new Exception($"Upload failed: {uploadResult.Error?.Message ?? "Unknown error"}");
        }
    }
}
