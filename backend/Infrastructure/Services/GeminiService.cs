using backend.Application.Interfaces;
using backend.Application.Repositories;
using backend.Application.Services;
using System.Text;
using System.Text.Json;

namespace backend.Infrastructure.Services
{
    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ITestServiceRepository _testServiceRepository;
        public GeminiService(HttpClient httpClient, 
            IConfiguration configuration,
            ITestServiceRepository testServiceRepository)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"];
            _testServiceRepository = testServiceRepository;
        }
        public async Task<string> GenerateReplyAsync(string prompt)
        {
            // Lấy danh sách dịch vụ xét nghiệm từ database
            var services = await _testServiceRepository.GetAllAsync();
            var serviceList = string.Join("\n", services.Select(s => $"- {s.ServiceName}: {s.Description}"));

            // Prompt chi tiết, an toàn
            var safePrompt = $@"
Bạn là trợ lý AI của WellCare - trung tâm chăm sóc sức khỏe giới tính.
- Dưới đây là các dịch vụ xét nghiệm hiện có tại WellCare:
{serviceList}
- Bạn chỉ cung cấp thông tin tham khảo về sức khỏe giới tính, xét nghiệm, các dịch vụ xét nghiệm và bảng giá liên quan đến các dịch vụ có sẵn.
- Không chẩn đoán bệnh, không đưa ra phác đồ điều trị, không khuyến khích tự ý dùng thuốc.
- Nếu khách hàng cần tư vấn chuyên sâu hoặc đặt lịch, hãy hướng dẫn họ liên hệ tư vấn viên hoặc sử dụng chức năng đặt lịch tư vấn trên hệ thống.
- Không sử dụng markdown, không trả lời thông tin nhạy cảm, không khuyến khích tự ý điều trị.
- Trả lời ngắn gọn, lịch sự, chỉ bằng tiếng Việt.

Câu hỏi của khách hàng: {prompt}
";

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
                                text = safePrompt
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