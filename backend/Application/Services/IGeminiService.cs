namespace backend.Application.Services
{
    public interface IGeminiService
    {
        Task<string> GenerateReplyAsync(string prompt);
    }
}
