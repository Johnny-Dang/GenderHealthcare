import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { CalendarCheck, ArrowRight, Calendar, Sparkles } from 'lucide-react'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import { useNavigate } from 'react-router-dom'

export default function CycleTrackingPage() {
  // State for cycle tracking data
  const [cycleType, setCycleType] = useState('regular') // 'regular' or 'irregular'
  const [lastPeriodDate, setLastPeriodDate] = useState('')
  const [cycleLength, setCycleLength] = useState(28) // Default cycle length
  const [periodDuration, setPeriodDuration] = useState(5) // Default period duration
  const [dateError, setDateError] = useState('')

  const navigate = useNavigate()

  // Calculate date limits
  const today = new Date()
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(today.getFullYear() - 1)

  const maxDate = today.toISOString().split('T')[0] // Today
  const minDate = oneYearAgo.toISOString().split('T')[0] // One year ago

  // Validate date selection
  const validatePeriodDate = (date) => {
    if (!date) {
      return 'Vui lòng chọn ngày bắt đầu kỳ kinh gần nhất'
    }

    const selectedDate = new Date(date)
    const todayDate = new Date()
    const oneYearAgoDate = new Date()
    oneYearAgoDate.setFullYear(todayDate.getFullYear() - 1)

    // Set time to start of day for accurate comparison
    selectedDate.setHours(0, 0, 0, 0)
    todayDate.setHours(0, 0, 0, 0)
    oneYearAgoDate.setHours(0, 0, 0, 0)

    if (selectedDate > todayDate) {
      return 'Không thể chọn ngày trong tương lai'
    }

    if (selectedDate < oneYearAgoDate) {
      return 'Chỉ có thể chọn ngày trong vòng 1 năm gần đây'
    }

    return ''
  }

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value
    setLastPeriodDate(newDate)

    // Validate immediately
    const error = validatePeriodDate(newDate)
    setDateError(error)
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate date before submission
    const dateValidationError = validatePeriodDate(lastPeriodDate)
    if (dateValidationError) {
      setDateError(dateValidationError)
      return
    }

    // Create data object
    const cycleData = {
      cycleType,
      lastPeriodDate,
      cycleLength,
      periodDuration
    }

    console.log('Navigating with cycle data:', cycleData)

    // Save data to session storage
    sessionStorage.setItem('cycleData', JSON.stringify(cycleData))

    // Use React Router's navigate function instead of window.location.href
    navigate('/cycle-tracking/result')
  }

  return (
    <>
      <Navigation />
      <div className='min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
          <div className='text-center mb-12 animate-fade-in-down'>
            <h1 className='text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600'>
              Công cụ tính chu kỳ kinh nguyệt
            </h1>
            <p className='text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed'>
              Công cụ này giúp bạn hiểu rõ cơ thể, dự đoán ngày hành kinh, ngày rụng trứng và giai đoạn có khả năng thụ
              thai cao.
            </p>
          </div>

          <div className='max-w-lg mx-auto animate-fade-in'>
            <form onSubmit={handleSubmit}>
              <Card className='mb-6 shadow-lg border-2 border-pink-100 overflow-hidden rounded-xl transition-all hover:shadow-xl'>
                <div className='absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-pink-100 to-transparent opacity-50 rounded-bl-full z-0'></div>

                <CardHeader className='relative z-10 bg-gradient-to-r from-pink-50 to-purple-50 pb-4 border-b border-pink-100'>
                  <div className='transition-transform hover:scale-[1.02]'>
                    <CardTitle className='flex items-center text-2xl text-pink-700'>
                      <CalendarCheck className='mr-2 text-pink-500 h-6 w-6' />
                      Thông tin chu kỳ
                    </CardTitle>
                    <CardDescription className='text-purple-500 mt-1'>
                      Nhập thông tin chu kỳ kinh nguyệt của bạn
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6 pt-6 relative z-10'>
                  <div>
                    <label className='block text-sm font-medium text-pink-700 mb-2'>Loại chu kỳ</label>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='transition-transform hover:-translate-y-1 active:scale-95'>
                        <Button
                          type='button'
                          variant={cycleType === 'regular' ? 'default' : 'outline'}
                          onClick={() => setCycleType('regular')}
                          className={`w-full transition-all ${
                            cycleType === 'regular'
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0'
                              : 'hover:border-pink-300 hover:bg-pink-50'
                          }`}
                        >
                          Đều đặn
                        </Button>
                      </div>
                      <div className='transition-transform hover:-translate-y-1 active:scale-95'>
                        <Button
                          type='button'
                          variant={cycleType === 'irregular' ? 'default' : 'outline'}
                          onClick={() => setCycleType('irregular')}
                          className={`w-full transition-all ${
                            cycleType === 'irregular'
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0'
                              : 'hover:border-pink-300 hover:bg-pink-50'
                          }`}
                        >
                          Không đều
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-pink-700 mb-2 flex items-center'>
                      <Calendar className='h-4 w-4 mr-1 text-pink-500' />
                      Ngày bắt đầu kỳ kinh gần nhất <span className='text-red-500 ml-1'>*</span>
                    </label>
                    <div className='transition-transform hover:-translate-y-1'>
                      <input
                        type='date'
                        value={lastPeriodDate}
                        onChange={handleDateChange}
                        min={minDate}
                        max={maxDate}
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white shadow-sm hover:shadow ${
                          dateError ? 'border-red-500 focus:ring-red-400' : 'border-pink-200 focus:ring-pink-400'
                        }`}
                        required
                      />
                      {dateError && (
                        <p className='text-red-500 text-xs mt-1 flex items-center'>
                          <span className='mr-1'>⚠️</span>
                          {dateError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-pink-700 mb-2'>
                      Độ dài chu kỳ trung bình: <span className='text-purple-600 font-bold'>{cycleLength}</span> ngày
                    </label>
                    <div className='flex items-center bg-pink-50 p-3 rounded-lg'>
                      <span className='text-xs text-pink-600 mr-2'>21</span>
                      <input
                        type='range'
                        min='21'
                        max='35'
                        value={cycleLength}
                        onChange={(e) => setCycleLength(parseInt(e.target.value))}
                        className='w-full cursor-pointer accent-pink-500 h-2'
                      />
                      <span className='text-xs text-pink-600 ml-2'>35</span>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-pink-700 mb-2'>
                      Số ngày hành kinh: <span className='text-purple-600 font-bold'>{periodDuration}</span> ngày
                    </label>
                    <div className='flex items-center bg-pink-50 p-3 rounded-lg'>
                      <span className='text-xs text-pink-600 mr-2'>2</span>
                      <input
                        type='range'
                        min='2'
                        max='10'
                        value={periodDuration}
                        onChange={(e) => setPeriodDuration(parseInt(e.target.value))}
                        className='w-full cursor-pointer accent-pink-500 h-2'
                      />
                      <span className='text-xs text-pink-600 ml-2'>10</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className='flex justify-between py-4 bg-gradient-to-r from-pink-50 to-purple-50 border-t border-pink-100 relative z-10'>
                  <div className='transition-transform hover:scale-105 active:scale-95'>
                    <Button
                      type='button'
                      onClick={() => {
                        setLastPeriodDate('')
                        setCycleLength(28)
                        setPeriodDuration(5)
                        setCycleType('regular')
                        setDateError('')
                      }}
                      variant='outline'
                      className='border-pink-200 text-pink-700 hover:bg-pink-50'
                    >
                      Đặt lại
                    </Button>
                  </div>
                  <div className='transition-transform hover:scale-105 active:scale-95'>
                    <Button
                      type='submit'
                      className='bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white flex items-center gap-2'
                    >
                      <span>Xem kết quả</span>
                      <ArrowRight className='h-4 w-4' />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </form>

            <div className='text-center mt-10 text-pink-600 opacity-0 animate-fade-in-delay'>
              <div className='flex justify-center items-center text-sm mb-4'>
                <Sparkles className='w-4 h-4 mr-1' />
                <span>Tất cả dữ liệu của bạn được bảo mật và không được chia sẻ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInDelay {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fadeInDelay 1.5s ease-out forwards;
        }
      `}</style>
    </>
  )
}
