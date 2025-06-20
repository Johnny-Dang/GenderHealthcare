using backend.Application.Interfaces;
using System.Text.Json;
using System.Text;
using backend.Application.Services;

namespace backend.Infrastructure.Services
{
    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"];
        }
        public async Task<string> GenerateReplyAsync(string prompt)
        {
            var requestBody = new
            {
                contents = new[]
           {
                new
                {
                    parts = new[]
                    {
                        new
                        {
                            text = $"Bạn là trợ lý AI của WellCare - trung tâm chăm sóc sức khỏe giới tính. Hãy trả lời câu hỏi sau một cách chuyên nghiệp, tư vấn về sức khỏe giới tính, xét nghiệm STD, và các dịch vụ liên quan. Trả lời ngắn gọn, không sử dụng markdown formatting, chỉ trả lời bằng văn bản thuần túy bằng tiếng Việt: {prompt}"
                        }
                    }
                }
            }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={_apiKey}";
            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);

            response.EnsureSuccessStatusCode();
            var responseJson = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(responseJson);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return CleanText(text);
        }

        private string? CleanText(string text)
        {
            return text?
                .Replace("**", "")
                .Replace("*", "")
                .Replace("`", "")
                .Trim();
        }
    }
}