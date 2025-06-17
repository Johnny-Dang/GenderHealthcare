namespace backend.Application.Interfaces
{
    public interface IGeminiService
    {
        Task<string> GenerateReplyAsync(string prompt);
    }
}
