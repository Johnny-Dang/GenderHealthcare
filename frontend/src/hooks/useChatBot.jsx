import { useState } from 'react'

export const useChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      content:
        'Xin chào! Tôi là trợ lý AI của WellCare. Tôi có thể giúp bạn tư vấn về các dịch vụ chăm sóc sức khỏe giới tính. Bạn có câu hỏi gì không?',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (content) => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // TODO: Thay YOUR_GEMINI_API_KEY bằng API key thật của bạn
      const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Bạn là trợ lý AI của WellCare - trung tâm chăm sóc sức khỏe giới tính. Hãy trả lời câu hỏi sau một cách chuyên nghiệp, tư vấn về sức khỏe giới tính, xét nghiệm STD, và các dịch vụ liên quan. Trả lời ngắn gọn, không sử dụng markdown formatting, chỉ trả lời bằng văn bản thuần túy bằng tiếng Việt: ${content}`
                  }
                ]
              }
            ]
          })
        }
      )

      const data = await response.json()

      if (data.candidates && data.candidates[0]) {
        let aiResponse = data.candidates[0].content.parts[0].text

        // Xử lý loại bỏ markdown formatting
        aiResponse = aiResponse
          .replace(/\*\*(.*?)\*\*/g, '$1') // Loại bỏ **bold**
          .replace(/\*(.*?)\*/g, '$1') // Loại bỏ *italic*
          .replace(/`(.*?)`/g, '$1') // Loại bỏ `code`
          .replace(/#{1,6}\s/g, '') // Loại bỏ headers
          .replace(/\n\s*\n/g, '\n') // Loại bỏ dòng trống thừa
          .trim()

        const aiMessage = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          isUser: false,
          timestamp: new Date()
        }

        setMessages((prev) => [...prev, aiMessage])
      } else {
        throw new Error('Không nhận được phản hồi từ AI')
      }
    } catch (error) {
      console.error('Lỗi khi gọi Gemini API:', error)

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content:
          'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ hotline 1900 1234 để được hỗ trợ trực tiếp.',
        isUser: false,
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([
      {
        id: '1',
        content:
          'Xin chào! Tôi là trợ lý AI của WellCare. Tôi có thể giúp bạn tư vấn về các dịch vụ chăm sóc sức khỏe giới tính. Bạn có câu hỏi gì không?',
        isUser: false,
        timestamp: new Date()
      }
    ])
  }

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  }
}
