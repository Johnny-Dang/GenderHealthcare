import { useState } from 'react'
import api from '../configs/axios'

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
      const response = await api.post('api/Gemini/chat', {
        prompt: content
      })

      // console.log('Gemini API response:', response)

      if (response.data) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          content: response.data,
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
