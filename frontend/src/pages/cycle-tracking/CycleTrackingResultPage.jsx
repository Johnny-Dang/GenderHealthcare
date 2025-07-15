import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  Info,
  ChevronLeft,
  ChevronRight,
  Droplets,
  HeartHandshake,
  Shield,
  ShieldCheck,
  X,
  Download,
  Printer
} from 'lucide-react'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'

// Custom Egg Icon component for ovulation day
const EggIcon = ({ className = '', size = 24, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      {...props}
    >
      <path d='M12 22c6.5 0 7.5-9 7.5-12.5a7.5 7.5 0 1 0-15 0C4.5 13 5.5 22 12 22z' />
    </svg>
  )
}

// Custom Test Tube Icon component for pregnancy test day
const TestTubeIcon = ({ className = '', size = 24, ...props }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      {...props}
    >
      <path d='M9 2v4M15 2v4M12 17v-7M9 10h6' />
      <path d='M8 2h8M12 22a4 4 0 0 1-4-4v-3a4 4 0 0 1 8 0v3a4 4 0 0 1-4 4z' />
    </svg>
  )
}

export default function CycleTrackingPageResult() {
  const navigate = useNavigate()
  const [cycleData, setCycleData] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState([])
  const [cycleInfo, setCycleInfo] = useState({
    periodDays: [],
    ovulationDay: null,
    fertileDays: [],
    relativelySafeDays: [],
    completelySafeDays: [],
    pregnancyTestDays: []
  })
  const [selectedDay, setSelectedDay] = useState(null)
  const [showDayDetails, setShowDayDetails] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  // Add ref for export section
  const exportContentRef = useRef(null)

  // Add state to track if we've calculated future months
  const [calculatedMonths, setCalculatedMonths] = useState(1)

  // Load cycle data from session storage
  useEffect(() => {
    const storedData = sessionStorage.getItem('cycleData')
    if (!storedData) {
      navigate('/cycle-tracking')
      return
    }

    const parsedData = JSON.parse(storedData)
    setCycleData(parsedData)
    calculateCycleDates(parsedData, 3) // Pre-calculate 3 months of data
  }, [navigate])

  // Calculate all important cycle dates
  const calculateCycleDates = (data, numberOfCycles = 1) => {
    if (!data || !data.lastPeriodDate) return

    const { lastPeriodDate, cycleLength, periodDuration } = data
    const startDate = new Date(lastPeriodDate)

    // Arrays to store all cycle data
    const periodDays = []
    const fertileDays = []
    const relativelySafeDays = []
    const completelySafeDays = []
    const pregnancyTestDays = []
    const ovulationDays = []

    // Calculate data for multiple cycles
    for (let cycle = 0; cycle < numberOfCycles; cycle++) {
      const cycleStartDate = new Date(startDate)
      cycleStartDate.setDate(startDate.getDate() + cycle * cycleLength)

      // Calculate period days for this cycle
      for (let i = 0; i < periodDuration; i++) {
        const day = new Date(cycleStartDate)
        day.setDate(cycleStartDate.getDate() + i)
        periodDays.push(day.toISOString().split('T')[0])
      }

      // Calculate ovulation day for this cycle
      const ovulationDate = new Date(cycleStartDate)
      ovulationDate.setDate(cycleStartDate.getDate() + cycleLength - 14)
      const ovulationDay = ovulationDate.toISOString().split('T')[0]
      ovulationDays.push(ovulationDay)

      // Calculate fertile window for this cycle
      for (let i = -5; i <= 0; i++) {
        const day = new Date(ovulationDate)
        day.setDate(ovulationDate.getDate() + i)
        fertileDays.push(day.toISOString().split('T')[0])
      }

      // Calculate pregnancy test days for this cycle
      const testDate = new Date(ovulationDate)
      testDate.setDate(ovulationDate.getDate() + 7)
      pregnancyTestDays.push(testDate.toISOString().split('T')[0])

      const secondTestDate = new Date(ovulationDate)
      secondTestDate.setDate(ovulationDate.getDate() + 10)
      pregnancyTestDays.push(secondTestDate.toISOString().split('T')[0])

      // Calculate relatively safe days for this cycle
      const firstSafeDay = new Date(cycleStartDate)
      firstSafeDay.setDate(cycleStartDate.getDate() + periodDuration)

      const lastSafeDay = new Date(ovulationDate)
      lastSafeDay.setDate(ovulationDate.getDate() - 6)

      let currentDay = new Date(firstSafeDay)
      while (currentDay <= lastSafeDay) {
        relativelySafeDays.push(currentDay.toISOString().split('T')[0])
        currentDay.setDate(currentDay.getDate() + 1)
      }

      // Calculate completely safe days for this cycle
      const firstCompletelySafeDay = new Date(ovulationDate)
      firstCompletelySafeDay.setDate(ovulationDate.getDate() + 1)

      const nextPeriodDate = new Date(cycleStartDate)
      nextPeriodDate.setDate(cycleStartDate.getDate() + cycleLength)

      currentDay = new Date(firstCompletelySafeDay)
      while (currentDay < nextPeriodDate) {
        if (!pregnancyTestDays.includes(currentDay.toISOString().split('T')[0])) {
          completelySafeDays.push(currentDay.toISOString().split('T')[0])
        }
        currentDay.setDate(currentDay.getDate() + 1)
      }
    }

    setCycleInfo({
      periodDays,
      ovulationDay: ovulationDays[0], // For backward compatibility
      ovulationDays,
      fertileDays,
      relativelySafeDays,
      completelySafeDays,
      pregnancyTestDays
    })

    setCalculatedMonths(numberOfCycles)

    // Generate calendar starting from the first period date
    generateCalendar(startDate)
  }

  // Generate calendar data
  const generateCalendar = (startDate) => {
    setCurrentMonth(new Date(startDate))
  }

  // Navigate to previous or next month
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)

      // Check if we need to calculate more months
      const currentMonthIndex =
        newMonth.getMonth() +
        (newMonth.getFullYear() - new Date(cycleData.lastPeriodDate).getFullYear()) * 12 -
        new Date(cycleData.lastPeriodDate).getMonth()

      if (currentMonthIndex >= calculatedMonths - 1 && calculatedMonths < 6) {
        // Calculate more months when approaching the edge of our data
        calculateCycleDates(cycleData, calculatedMonths + 2)
      }
    }
    setCurrentMonth(newMonth)
  }

  // Generate days for current month
  const getDaysInMonth = () => {
    if (!currentMonth) return []

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // First day of month
    const firstDay = new Date(year, month, 1)
    // Last day of month
    const lastDay = new Date(year, month + 1, 0)

    // Get the day of week for the first day (0-6, where 0 is Sunday)
    const firstDayOfWeek = firstDay.getDay()

    // Create array for all days in calendar view
    const calendarDaysArray = []

    // Add empty slots for days from previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -firstDayOfWeek + i + 1)
      calendarDaysArray.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        dateString: prevMonthDay.toISOString().split('T')[0]
      })
    }

    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      calendarDaysArray.push({
        date,
        isCurrentMonth: true,
        dateString: date.toISOString().split('T')[0]
      })
    }

    // Add days from next month to complete the calendar grid (maximum 42 days = 6 weeks)
    const remainingDays = 42 - calendarDaysArray.length
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonthDay = new Date(year, month + 1, day)
      calendarDaysArray.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        dateString: nextMonthDay.toISOString().split('T')[0]
      })
    }

    return calendarDaysArray
  }

  // Get day type for styling
  const getDayType = (dateString) => {
    if (cycleInfo.periodDays.includes(dateString)) {
      return 'period'
    } else if (dateString === cycleInfo.ovulationDay) {
      return 'ovulation'
    } else if (cycleInfo.fertileDays.includes(dateString)) {
      return 'fertile'
    } else if (cycleInfo.pregnancyTestDays.includes(dateString)) {
      return 'pregnancy-test'
    } else if (cycleInfo.relativelySafeDays.includes(dateString)) {
      return 'relatively-safe'
    } else if (cycleInfo.completelySafeDays.includes(dateString)) {
      return 'completely-safe'
    }
    return 'regular'
  }

  // Add useEffect for staggered animations
  useEffect(() => {
    if (cycleData) {
      const cards = document.querySelectorAll('.animate-on-load')
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('animate-slide-up')
          card.style.opacity = '1'
        }, 150 * index)
      })
    }
  }, [cycleData])

  // Format month and year
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('vi-VN', {
      month: 'long',
      year: 'numeric'
    })
  }

  // Generate next 3 cycles
  const getNextCycles = () => {
    if (!cycleData) return []

    const { lastPeriodDate, cycleLength } = cycleData
    const cycles = []

    for (let i = 0; i < 3; i++) {
      const startDate = new Date(lastPeriodDate)
      startDate.setDate(startDate.getDate() + cycleLength * i)

      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + cycleData.periodDuration - 1)

      const ovulationDate = new Date(startDate)
      ovulationDate.setDate(startDate.getDate() + cycleLength - 14)

      cycles.push({
        periodStart: startDate.toLocaleDateString('vi-VN'),
        periodEnd: endDate.toLocaleDateString('vi-VN'),
        ovulation: ovulationDate.toLocaleDateString('vi-VN')
      })
    }

    return cycles
  }

  const cycleForecasts = getNextCycles()
  const calendarDaysArray = getDaysInMonth()

  // Add new function to handle day click
  const handleDayClick = (day) => {
    if (!day.isCurrentMonth) return // Don't show details for days from other months

    setSelectedDay(day)
    setShowDayDetails(true)
  }

  // Function to get detailed description for a day
  const getDayDetails = (dateString) => {
    if (cycleInfo.periodDays.includes(dateString)) {
      return {
        title: 'Ngày có kinh nguyệt',
        description:
          'Đây là thời gian cơ thể bạn đang giải phóng niêm mạc tử cung. Hãy chú ý nghỉ ngơi và uống đủ nước.',
        icon: <Droplets className='h-5 w-5 text-white' />,
        color: 'bg-red-400',
        textColor: 'text-red-700'
      }
    } else if (dateString === cycleInfo.ovulationDay) {
      return {
        title: 'Ngày rụng trứng',
        description: 'Ngày này buồng trứng giải phóng trứng. Đây là thời điểm khả năng thụ thai cao nhất.',
        icon: <EggIcon className='h-5 w-5 text-white' />,
        color: 'bg-purple-500',
        textColor: 'text-purple-700'
      }
    } else if (cycleInfo.fertileDays.includes(dateString)) {
      return {
        title: 'Ngày có khả năng thụ thai cao',
        description:
          'Giai đoạn này trứng có thể được thụ tinh. Nếu không muốn mang thai, hãy sử dụng biện pháp tránh thai.',
        icon: <HeartHandshake className='h-5 w-5 text-amber-800' />,
        color: 'bg-amber-300',
        textColor: 'text-amber-700'
      }
    } else if (cycleInfo.pregnancyTestDays.includes(dateString)) {
      return {
        title: 'Ngày nên thử thai',
        description:
          'Nếu bạn có quan hệ trong những ngày rụng trứng, đây là thời điểm có thể thử thai để biết kết quả.',
        icon: <TestTubeIcon className='h-5 w-5 text-fuchsia-700' />,
        color: 'bg-fuchsia-300',
        textColor: 'text-fuchsia-700'
      }
    } else if (cycleInfo.relativelySafeDays.includes(dateString)) {
      return {
        title: 'Ngày an toàn tương đối',
        description: 'Khả năng thụ thai thấp hơn, nhưng vẫn nên sử dụng biện pháp tránh thai nếu không muốn mang thai.',
        icon: <Shield className='h-5 w-5 text-blue-600' />,
        color: 'bg-blue-200',
        textColor: 'text-blue-700'
      }
    } else if (cycleInfo.completelySafeDays.includes(dateString)) {
      return {
        title: 'Ngày an toàn tuyệt đối',
        description: 'Giai đoạn này khả năng thụ thai rất thấp, nhưng không nên chủ quan.',
        icon: <ShieldCheck className='h-5 w-5 text-green-700' />,
        color: 'bg-green-300',
        textColor: 'text-green-700'
      }
    }

    return {
      title: 'Ngày thường',
      description: 'Không có sự kiện đặc biệt nào vào ngày này.',
      icon: null,
      color: 'bg-gray-100',
      textColor: 'text-gray-700'
    }
  }

  // Simplify export function
  const handleExport = async (type = 'pdf') => {
    setIsGenerating(true)

    try {
      // Simulate PDF generation delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real implementation, you would use a library like jspdf, html2canvas, or react-pdf
      if (type === 'pdf') {
        const fileName = `CycleTracking_${new Date().toISOString().split('T')[0]}.pdf`
        console.log(`Exporting PDF: ${fileName}`)
      } else if (type === 'print') {
        console.log('Printing document')
      }

      // Simulate successful download
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Error generating export:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Format cycle data for export
  const formatCycleDataForExport = () => {
    if (!cycleData) return ''

    const formattedDate = new Date(cycleData.lastPeriodDate).toLocaleDateString('vi-VN')
    const ovulationDate = new Date(cycleInfo.ovulationDay).toLocaleDateString('vi-VN')

    return `
      Thông tin chu kỳ kinh nguyệt
      
      Kỳ kinh gần nhất: ${formattedDate}
      Độ dài chu kỳ: ${cycleData.cycleLength} ngày
      Số ngày hành kinh: ${cycleData.periodDuration} ngày
      Ngày rụng trứng: ${ovulationDate}
      
      Dự báo chu kỳ tới:
      ${cycleForecasts
        .map((cycle, i) => `Chu kỳ ${i + 1}: ${cycle.periodStart} - ${cycle.periodEnd}, Rụng trứng: ${cycle.ovulation}`)
        .join('\n')}
    `
  }

  // Calculate the month difference from the start date
  const getMonthDifference = (date) => {
    if (!cycleData || !cycleData.lastPeriodDate) return 0

    const startDate = new Date(cycleData.lastPeriodDate)
    return date.getMonth() - startDate.getMonth() + (date.getFullYear() - startDate.getFullYear()) * 12
  }

  // Check if we've moved far away from our calculated data
  useEffect(() => {
    if (!cycleData) return

    const monthDiff = getMonthDifference(currentMonth)
    if (monthDiff >= calculatedMonths - 1 && calculatedMonths < 6) {
      calculateCycleDates(cycleData, calculatedMonths + 2)
    }
  }, [currentMonth, cycleData, calculatedMonths])

  if (!cycleData) {
    return <div className='flex justify-center items-center h-screen'>Đang tải...</div>
  }

  const monthDiff = getMonthDifference(currentMonth)

  return (
    <>
      <Navigation />
      <div className='min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 py-12 relative overflow-hidden'>
        {/* Background decorative elements */}
        <div className='absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0'>
          <div className='absolute top-10 left-10 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob'></div>
          <div className='absolute top-[30%] right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000'></div>
          <div className='absolute bottom-10 left-1/3 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000'></div>
        </div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          <div className='text-center mb-12 animate-fade-in-down'>
            <h1 className='text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 animate-gradient-x'>
              Kết quả theo dõi chu kỳ
            </h1>
            <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
              Hiển thị chi tiết chu kỳ kinh nguyệt và các ngày quan trọng của bạn
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Left Column - Cycle Information */}
            <div className='lg:col-span-1 space-y-6'>
              {/* Main Cycle Card */}
              <Card className='shadow-lg border-2 border-pink-100 overflow-hidden rounded-xl hover:shadow-xl transition-all duration-500 animate-on-load opacity-0 transform hover:translate-y-[-5px]'>
                <CardHeader className='bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100'>
                  <CardTitle className='text-2xl text-pink-700'>Thông tin chu kỳ</CardTitle>
                  <CardDescription className='text-purple-500'>Dựa trên dữ liệu bạn cung cấp</CardDescription>
                </CardHeader>
                <CardContent className='pt-6 space-y-4'>
                  <div className='flex justify-between items-center p-3 bg-pink-50 rounded-lg'>
                    <span className='text-pink-700 font-medium'>Loại chu kỳ:</span>
                    <span className='font-semibold'>{cycleData.cycleType === 'regular' ? 'Đều đặn' : 'Không đều'}</span>
                  </div>
                  <div className='flex justify-between items-center p-3 bg-purple-50 rounded-lg'>
                    <span className='text-purple-700 font-medium'>Kỳ kinh gần nhất:</span>
                    <span className='font-semibold'>
                      {new Date(cycleData.lastPeriodDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className='flex justify-between items-center p-3 bg-pink-50 rounded-lg'>
                    <span className='text-pink-700 font-medium'>Độ dài chu kỳ:</span>
                    <span className='font-semibold'>{cycleData.cycleLength} ngày</span>
                  </div>
                  <div className='flex justify-between items-center p-3 bg-purple-50 rounded-lg'>
                    <span className='text-purple-700 font-medium'>Số ngày hành kinh:</span>
                    <span className='font-semibold'>{cycleData.periodDuration} ngày</span>
                  </div>
                </CardContent>
              </Card>

              {/* Color Legend Card */}
              <Card className='shadow-md border border-pink-100 overflow-hidden rounded-xl animate-on-load opacity-0 transform hover:shadow-lg hover:border-pink-200 transition-all duration-500'>
                <CardHeader className='bg-gradient-to-r from-pink-50 to-purple-50 py-4'>
                  <CardTitle className='text-xl text-pink-700 flex items-center'>
                    <Info className='w-5 h-5 mr-2' />
                    Chú thích màu sắc
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-4 pb-2'>
                  <div className='space-y-5'>
                    <div>
                      <div className='flex items-center'>
                        <div className='w-6 h-6 rounded-full bg-red-400 mr-3 flex items-center justify-center'>
                          <Droplets className='h-3.5 w-3.5 text-white' />
                        </div>
                        <span className='text-gray-700 font-medium'>Ngày có kinh nguyệt</span>
                      </div>
                      <p className='text-xs text-gray-500 mt-1 ml-9'>
                        Giai đoạn cơ thể giải phóng niêm mạc tử cung. Thường kéo dài từ 3-7 ngày.
                      </p>
                    </div>

                    <div>
                      <div className='flex items-center'>
                        <div className='w-6 h-6 rounded-full bg-purple-500 mr-3 flex items-center justify-center'>
                          <EggIcon className='h-3.5 w-3.5 text-white' />
                        </div>
                        <span className='text-gray-700 font-medium'>Ngày rụng trứng</span>
                      </div>
                      <p className='text-xs text-gray-500 mt-1 ml-9'>
                        Ngày buồng trứng giải phóng trứng. Thường xảy ra khoảng 14 ngày trước kỳ kinh tiếp theo.
                      </p>
                    </div>

                    <div>
                      <div className='flex items-center'>
                        <div className='w-6 h-6 rounded-full bg-amber-300 mr-3 flex items-center justify-center'>
                          <HeartHandshake className='h-3.5 w-3.5 text-amber-800' />
                        </div>
                        <span className='text-gray-700 font-medium'>Giai đoạn có khả năng thụ thai</span>
                      </div>
                      <p className='text-xs text-gray-500 mt-1 ml-9'>
                        Khoảng thời gian 5 ngày trước và trong ngày rụng trứng. Khả năng thụ thai cao nhất.
                      </p>
                    </div>

                    <div>
                      <div className='flex items-center'>
                        <div className='w-6 h-6 rounded-full bg-fuchsia-300 mr-3 flex items-center justify-center'>
                          <TestTubeIcon className='h-3.5 w-3.5 text-fuchsia-700' />
                        </div>
                        <span className='text-gray-700 font-medium'>Ngày nên thử thai</span>
                      </div>
                      <p className='text-xs text-gray-500 mt-1 ml-9'>
                        Một tuần sau khi thụ tinh, bạn nên dùng các biện pháp thử thai để kiểm tra kết quả thụ tinh có
                        thành công hay không nhé.
                      </p>
                    </div>

                    <div>
                      <div className='flex items-center'>
                        <div className='w-6 h-6 rounded-full bg-blue-200 mr-3 flex items-center justify-center'>
                          <Shield className='h-3.5 w-3.5 text-blue-600' />
                        </div>
                        <span className='text-gray-700 font-medium'>Ngày an toàn tương đối</span>
                      </div>
                      <p className='text-xs text-gray-500 mt-1 ml-9'>
                        Thời gian sau kỳ kinh và trước giai đoạn rụng trứng. Khả năng thụ thai thấp hơn.
                      </p>
                    </div>

                    <div>
                      <div className='flex items-center'>
                        <div className='w-6 h-6 rounded-full bg-green-300 mr-3 flex items-center justify-center'>
                          <ShieldCheck className='h-3.5 w-3.5 text-green-700' />
                        </div>
                        <span className='text-gray-700 font-medium'>Ngày an toàn tuyệt đối</span>
                      </div>
                      <p className='text-xs text-gray-500 mt-1 ml-9'>
                        Sau khi rụng trứng đến trước kỳ kinh tiếp theo. Khả năng thụ thai rất thấp.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Forecast Card */}
              <Card className='shadow-md border border-pink-100 overflow-hidden rounded-xl animate-on-load opacity-0 transform hover:shadow-lg hover:border-pink-200 transition-all duration-500'>
                <CardHeader className='bg-gradient-to-r from-pink-50 to-purple-50 py-4'>
                  <CardTitle className='text-xl text-pink-700'>Dự báo 3 chu kỳ tới</CardTitle>
                </CardHeader>
                <CardContent className='pt-4'>
                  <div className='space-y-4'>
                    {cycleForecasts.map((cycle, index) => (
                      <div key={index} className='p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg'>
                        <div className='font-medium text-pink-700'>Chu kỳ {index + 1}</div>
                        <div className='text-sm mt-1 text-gray-700'>
                          <div className='flex justify-between mt-1'>
                            <span>Kỳ kinh:</span>
                            <span>
                              {cycle.periodStart} - {cycle.periodEnd}
                            </span>
                          </div>
                          <div className='flex justify-between mt-1'>
                            <span>Rụng trứng:</span>
                            <span>{cycle.ovulation}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className='text-center animate-on-load opacity-0'>
                <Button
                  onClick={() => navigate('/cycle-tracking')}
                  className='bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white flex items-center gap-2 mx-auto shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] active:translate-y-[1px]'
                >
                  <ArrowLeft className='h-4 w-4' />
                  <span>Quay lại điều chỉnh</span>
                </Button>
              </div>
            </div>

            {/* Right Column - Calendar */}
            <div className='lg:col-span-2'>
              <Card className='shadow-lg border-2 border-pink-100 overflow-hidden rounded-xl hover:shadow-xl transition-all duration-500 animate-on-load opacity-0'>
                <CardHeader className='bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100 pb-4'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-2xl text-pink-700 flex items-center'>
                      <CalendarIcon className='mr-2 text-pink-500 h-6 w-6' />
                      Lịch chu kỳ kinh nguyệt
                      {monthDiff > 0 && <span className='ml-2 text-sm text-pink-500'>(+{monthDiff} tháng)</span>}
                    </CardTitle>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => navigateMonth('prev')}
                        className='h-8 w-8 p-0 border-pink-200'
                      >
                        <ChevronLeft className='h-4 w-4' />
                        <span className='sr-only'>Tháng trước</span>
                      </Button>
                      <div className='min-w-[150px] text-center font-medium'>{formatMonthYear(currentMonth)}</div>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => navigateMonth('next')}
                        className='h-8 w-8 p-0 border-pink-200'
                      >
                        <ChevronRight className='h-4 w-4' />
                        <span className='sr-only'>Tháng sau</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-6'>
                  <div className='grid grid-cols-7 gap-1 text-center mb-2'>
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                      <div key={day} className='text-sm font-semibold text-gray-600 p-2'>
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className='grid grid-cols-7 gap-1'>
                    {calendarDaysArray.map((day, index) => {
                      const dayType = getDayType(day.dateString)
                      return (
                        <div
                          key={index}
                          className={`
                            aspect-square p-1 relative rounded-md cursor-pointer
                            ${!day.isCurrentMonth && 'opacity-40'}
                            ${dayType === 'period' && 'bg-red-100'}
                            ${dayType === 'ovulation' && 'bg-purple-100'}
                            ${dayType === 'fertile' && 'bg-amber-100'}
                            ${dayType === 'pregnancy-test' && 'bg-fuchsia-100'}
                            ${dayType === 'relatively-safe' && 'bg-blue-50'}
                            ${dayType === 'completely-safe' && 'bg-green-50'}
                            hover:bg-opacity-80 transition-all duration-200
                            hover:scale-105 hover:shadow-md
                            active:scale-95 active:shadow-inner
                          `}
                          onClick={() => handleDayClick(day)}
                        >
                          <div className='flex flex-col h-full'>
                            <div className='text-right text-sm p-1'>{day.date.getDate()}</div>
                            <div className='flex-grow flex items-center justify-center'>
                              {dayType === 'period' && (
                                <div className='w-6 h-6 rounded-full bg-red-400 flex items-center justify-center animate-pulse-slow'>
                                  <Droplets className='h-3.5 w-3.5 text-white' />
                                </div>
                              )}
                              {dayType === 'ovulation' && (
                                <div className='w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center animate-bounce-subtle'>
                                  <EggIcon className='h-3.5 w-3.5 text-white' />
                                </div>
                              )}
                              {dayType === 'fertile' && (
                                <div className='w-6 h-6 rounded-full bg-amber-300 flex items-center justify-center animate-pulse-slow'>
                                  <HeartHandshake className='h-3.5 w-3.5 text-amber-800' />
                                </div>
                              )}
                              {dayType === 'pregnancy-test' && (
                                <div className='w-6 h-6 rounded-full bg-fuchsia-300 flex items-center justify-center'>
                                  <TestTubeIcon className='h-3.5 w-3.5 text-fuchsia-700' />
                                </div>
                              )}
                              {dayType === 'relatively-safe' && (
                                <div className='w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center'>
                                  <Shield className='h-3.5 w-3.5 text-blue-600' />
                                </div>
                              )}
                              {dayType === 'completely-safe' && (
                                <div className='w-6 h-6 rounded-full bg-green-300 flex items-center justify-center'>
                                  <ShieldCheck className='h-3.5 w-3.5 text-green-700' />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
                <CardFooter className='bg-gradient-to-r from-pink-50 to-purple-50 border-t border-pink-100 py-3 text-center text-sm text-gray-600'>
                  <div className='w-full'>
                    <p className='italic'>
                      Lưu ý: Dự đoán được tính toán dựa trên thông tin bạn cung cấp và có thể không chính xác 100%
                    </p>
                    {monthDiff > 0 && (
                      <p className='mt-1 text-pink-600'>
                        Dự đoán đang hiển thị cho tháng thứ {monthDiff + 1} tính từ kỳ kinh cuối cùng
                      </p>
                    )}
                  </div>
                </CardFooter>
              </Card>

              {/* Health Tips */}
              <Card className='mt-6 shadow-md border border-pink-100 overflow-hidden rounded-xl animate-on-load opacity-0 transform hover:shadow-lg hover:border-pink-200 transition-all duration-500'>
                <CardHeader className='bg-gradient-to-r from-pink-50 to-purple-50 py-4'>
                  <CardTitle className='text-xl text-pink-700'>Lời khuyên sức khỏe</CardTitle>
                </CardHeader>
                <CardContent className='pt-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='p-4 bg-pink-50 rounded-lg'>
                      <h3 className='font-medium text-pink-700 mb-2'>Trong ngày hành kinh</h3>
                      <ul className='text-sm space-y-2'>
                        <li>• Uống nhiều nước và nghỉ ngơi đầy đủ</li>
                        <li>• Chườm ấm để giảm đau bụng kinh</li>
                        <li>• Tránh thức ăn cay nóng và caffeine</li>
                      </ul>
                    </div>
                    <div className='p-4 bg-purple-50 rounded-lg'>
                      <h3 className='font-medium text-purple-700 mb-2'>Thời kỳ rụng trứng</h3>
                      <ul className='text-sm space-y-2'>
                        <li>• Theo dõi các dấu hiệu rụng trứng (đau bụng, thay đổi dịch âm đạo)</li>
                        <li>• Tăng cường vitamin và canxi</li>
                        <li>• Thích hợp để thụ thai nếu đang có kế hoạch</li>
                      </ul>
                    </div>
                    <div className='p-4 bg-blue-50 rounded-lg'>
                      <h3 className='font-medium text-blue-700 mb-2'>Giai đoạn an toàn</h3>
                      <ul className='text-sm space-y-2'>
                        <li>• Vẫn nên sử dụng biện pháp tránh thai nếu không muốn mang thai</li>
                        <li>• Duy trì chế độ ăn uống cân bằng và luyện tập đều đặn</li>
                        <li>• Theo dõi các thay đổi bất thường của cơ thể</li>
                      </ul>
                    </div>
                    <div className='p-4 bg-green-50 rounded-lg'>
                      <h3 className='font-medium text-green-700 mb-2'>Chăm sóc sức khỏe tổng quát</h3>
                      <ul className='text-sm space-y-2'>
                        <li>• Khám phụ khoa định kỳ 6 tháng một lần</li>
                        <li>• Bổ sung đầy đủ sắt, canxi và các vitamin thiết yếu</li>
                        <li>• Giữ tinh thần thoải mái, hạn chế căng thẳng</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Day Details Popup/Modal */}
      {showDayDetails && selectedDay && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm'>
          <div
            className='bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 animate-scale-in'
            style={{ maxWidth: '90vw' }}
          >
            <div className='flex justify-between items-start mb-4'>
              <h3 className='text-2xl font-semibold'>
                {selectedDay.date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <button
                onClick={() => setShowDayDetails(false)}
                className='text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100 p-1'
              >
                <X size={24} />
              </button>
            </div>

            {(() => {
              const details = getDayDetails(selectedDay.dateString)
              return (
                <div className='space-y-4'>
                  <div className={`p-4 rounded-lg ${details.color} bg-opacity-20 flex items-center space-x-3`}>
                    {details.icon && (
                      <div className={`w-10 h-10 rounded-full ${details.color} flex items-center justify-center`}>
                        {details.icon}
                      </div>
                    )}
                    <div>
                      <h4 className={`font-medium ${details.textColor}`}>{details.title}</h4>
                    </div>
                  </div>

                  <p className='text-gray-700'>{details.description}</p>

                  {getDayType(selectedDay.dateString) === 'period' && (
                    <div className='p-4 bg-pink-50 rounded-lg'>
                      <h4 className='font-medium text-pink-700 mb-1'>Lời khuyên:</h4>
                      <p className='text-sm text-gray-700'>
                        Hãy uống nhiều nước, nghỉ ngơi đầy đủ và tránh thức ăn cay nóng trong những ngày hành kinh.
                      </p>
                    </div>
                  )}

                  {getDayType(selectedDay.dateString) === 'ovulation' && (
                    <div className='p-4 bg-purple-50 rounded-lg'>
                      <h4 className='font-medium text-purple-700 mb-1'>Lời khuyên:</h4>
                      <p className='text-sm text-gray-700'>
                        Đây là thời điểm tốt nhất để thụ thai. Nếu không muốn có thai, hãy sử dụng biện pháp tránh thai
                        hiệu quả.
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}

            <div className='mt-6 flex justify-end'>
              <Button
                onClick={() => setShowDayDetails(false)}
                className='bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white'
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm'>
          <div
            className='bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 animate-scale-in'
            style={{ maxWidth: '90vw' }}
          >
            <div className='flex justify-between items-start mb-4'>
              <h3 className='text-2xl font-semibold'>Xuất dữ liệu chu kỳ</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className='text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100 p-1'
              >
                <X size={24} />
              </button>
            </div>

            <div className='space-y-4'>
              <div className='p-4 bg-purple-50 rounded-lg'>
                <h4 className='font-medium text-purple-700 mb-2 flex items-center'>
                  <Download className='w-5 h-5 mr-2' />
                  Xuất dữ liệu chu kỳ
                </h4>
                <p className='text-gray-700 text-sm'>
                  Tệp PDF sẽ bao gồm thông tin chi tiết về chu kỳ kinh nguyệt, ngày rụng trứng, và dự báo chu kỳ tới của
                  bạn.
                </p>
              </div>

              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    id='include-all'
                    name='include'
                    defaultChecked
                    className='w-4 h-4 text-pink-600'
                  />
                  <label htmlFor='include-all' className='text-sm text-gray-700'>
                    Bao gồm tất cả thông tin chu kỳ
                  </label>
                </div>
                <div className='flex items-center space-x-2'>
                  <input type='radio' id='include-basic' name='include' className='w-4 h-4 text-pink-600' />
                  <label htmlFor='include-basic' className='text-sm text-gray-700'>
                    Chỉ bao gồm thông tin cơ bản
                  </label>
                </div>
              </div>

              <div className='flex gap-2 mt-2'>
                <Button
                  onClick={() => handleExport('pdf')}
                  disabled={isGenerating}
                  className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex-1 flex items-center justify-center gap-2'
                >
                  {isGenerating ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <Download className='h-4 w-4' />
                      <span>Tải xuống PDF</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleExport('print')}
                  disabled={isGenerating}
                  className='bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white flex items-center justify-center gap-2'
                >
                  <Printer className='h-4 w-4' />
                  <span>In</span>
                </Button>
              </div>

              {exportSuccess && (
                <div className='mt-3 p-3 bg-green-50 text-green-700 rounded-md flex items-center'>
                  <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2'>
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M20 6L9 17L4 12'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </div>
                  <span className='text-sm'>Tệp PDF đã được tải xuống thành công!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden content for PDF export */}
      <div className='hidden'>
        <div ref={exportContentRef} className='p-8 bg-white'>
          <h1 className='text-2xl font-bold text-center mb-6'>Báo cáo chu kỳ kinh nguyệt</h1>

          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-3'>Thông tin cá nhân</h2>
            <div className='border-b pb-1 mb-1 flex'>
              <span className='font-medium w-1/2'>Ngày tạo báo cáo:</span>
              <span>{new Date().toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-3'>Thông tin chu kỳ</h2>
            <div className='border-b pb-1 mb-1 flex'>
              <span className='font-medium w-1/2'>Chu kỳ gần nhất:</span>
              <span>{new Date(cycleData.lastPeriodDate).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className='border-b pb-1 mb-1 flex'>
              <span className='font-medium w-1/2'>Độ dài chu kỳ:</span>
              <span>{cycleData.cycleLength} ngày</span>
            </div>
            <div className='border-b pb-1 mb-1 flex'>
              <span className='font-medium w-1/2'>Số ngày hành kinh:</span>
              <span>{cycleData.periodDuration} ngày</span>
            </div>
            <div className='border-b pb-1 mb-1 flex'>
              <span className='font-medium w-1/2'>Loại chu kỳ:</span>
              <span>{cycleData.cycleType === 'regular' ? 'Đều đặn' : 'Không đều'}</span>
            </div>
          </div>

          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-3'>Dự báo chu kỳ tới</h2>
            {cycleForecasts.map((cycle, index) => (
              <div key={index} className='mb-4 border p-3 rounded'>
                <div className='font-medium'>Chu kỳ {index + 1}</div>
                <div className='text-sm mt-1'>
                  <div className='flex justify-between mt-1'>
                    <span>Kỳ kinh:</span>
                    <span>
                      {cycle.periodStart} - {cycle.periodEnd}
                    </span>
                  </div>
                  <div className='flex justify-between mt-1'>
                    <span>Rụng trứng:</span>
                    <span>{cycle.ovulation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-8 text-center text-sm text-gray-500'>
            <p>Báo cáo này được tạo bởi ứng dụng GenderHealthcare</p>
            <p>Lưu ý: Dự đoán được tính toán dựa trên thông tin bạn cung cấp và có thể không chính xác 100%</p>
          </div>
        </div>
      </div>

      <Footer />
      <style>{`
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
        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out forwards;
        }
        
        @keyframes pulseSlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow {
          animation: pulseSlow 2s infinite;
        }
        
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle {
          animation: bounceSlow 2s infinite;
        }
        
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s forwards;
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.3s forwards;
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
        
        @keyframes gradientX {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradientX 3s ease infinite;
        }
        
        @keyframes gradientSlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradientSlow 8s ease infinite;
        }
        
        @keyframes blob {
          0% { transform: scale(1); }
          33% { transform: scale(1.1); }
          66% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        @keyframes bounceOnce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        .animate-bounce-once {
          animation: bounceOnce 2s ease;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  )
}
