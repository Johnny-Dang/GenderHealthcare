import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send, ChevronDown, Bot } from 'lucide-react'
import { useChatBot } from '@/hooks/useChatBot'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)
  const chatBoxRef = useRef(null)
  const { messages, isLoading, sendMessage, clearMessages } = useChatBot()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Xử lý đóng chatbox khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatBoxRef.current && !chatBoxRef.current.contains(event.target) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      await sendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleReset = () => {
    clearMessages()
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Chat Button */}
      <div className='fixed bottom-6 right-6 z-50'>
        <Button
          onClick={handleOpen}
          className={`w-14 h-14 rounded-full bg-gradient-primary hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
            isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <MessageCircle className='w-6 h-6' />
        </Button>
      </div>

      {/* Chat Popup */}
      <div
        ref={chatBoxRef}
        className={`fixed bottom-6 right-6 z-50 w-96 rounded-2xl shadow-2xl transition-all duration-300 transform origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-12 pointer-events-none'
        }`}
      >
        <Card className='h-[500px] border-0 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm'>
          {/* Header */}
          <CardHeader className='bg-gradient-primary text-white p-4 flex flex-row items-center justify-between'>
            <CardTitle className='text-lg font-semibold flex items-center gap-2'>
              <Bot className='w-5 h-5' />
              <span>Trợ lý WellCare</span>
            </CardTitle>
            <div className='flex items-center gap-1.5'>
              <button
                onClick={handleReset}
                className='p-1.5 rounded-full hover:bg-white/20 transition-colors'
                title='Bắt đầu cuộc trò chuyện mới'
              >
                <ChevronDown className='w-4 h-4 text-white' />
              </button>
              <button
                onClick={handleClose}
                className='p-1.5 rounded-full hover:bg-white/20 transition-colors'
                title='Đóng hộp trò chuyện'
              >
                <X className='w-4 h-4 text-white' />
              </button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className='p-0 h-full flex flex-col'>
            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-pink-50 to-purple-50'>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                      message.isUser
                        ? 'bg-gradient-primary text-white rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <div>{message.content}</div>
                    <div className={`text-xs mt-1 text-right ${message.isUser ? 'text-white/70' : 'text-gray-400'}`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className='flex justify-start animate-fade-in'>
                  <div className='bg-white p-3 rounded-2xl rounded-tl-none shadow-sm'>
                    <div className='flex items-center gap-1 py-1'>
                      <div className='w-2 h-2 bg-primary-300 rounded-full animate-bounce'></div>
                      <div
                        className='w-2 h-2 bg-primary-400 rounded-full animate-bounce'
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                      <div
                        className='w-2 h-2 bg-primary-500 rounded-full animate-bounce'
                        style={{ animationDelay: '0.4s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className='border-t p-3 bg-white'>
              <div className='flex gap-2 items-center'>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Nhập câu hỏi của bạn...'
                  disabled={isLoading}
                  className='flex-1 border-pink-100 focus:border-pink-200 rounded-full py-2 px-4'
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  size='sm'
                  className='bg-gradient-primary hover:opacity-90 rounded-full w-10 h-10 p-0 flex items-center justify-center'
                >
                  <Send className='w-4 h-4' />
                </Button>
              </div>
              <div className='text-xs text-gray-400 text-center mt-2'>
                Trợ lý AI hỗ trợ tư vấn 24/7 về sức khỏe giới tính
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default ChatBot
