namespace backend.Application.Services
{
    public interface ICloudinaryService
    {
        Task<string> UploadPdfAsync(IFormFile file, string folder);
    }
}
