import React, { useState, useEffect, useMemo } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  User,
  Loader,
  Eye,
  CreditCard,
  MessageCircle,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSelector } from 'react-redux'
import api from '@/configs/axios'
// Import Ant Design components for tabs
import { Tabs } from 'antd'
// Import Recharts components for pie charts
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const { TabPane } = Tabs

const truncateId = (id, length = 8) => {
  if (!id) return ''
  return id.toString().length > length ? id.toString().substring(0, length) + '...' : id.toString()
}

const copyToClipboard = (text) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert('Mã đã được sao chép!')
    })
    .catch((err) => {
      console.error('Không thể sao chép: ', err)
    })
}

const BookingCard = ({
  booking,
  navigate,
  handleShowPayment,
  handleRepayment,
  getStatusIcon,
  getStatusColor,
  getStatusBadgeContrast,
  bookingServices
}) => {
  const services = bookingServices?.[booking.bookingId] || []
  const hasServices = services.length > 0
  const formattedDate = new Date(booking.createAt).toLocaleDateString('vi-VN')
  const formattedUpdateDate = booking.updateAt
    ? new Date(booking.updateAt).toLocaleDateString('vi-VN')
    : 'Chưa cập nhật'

  return (
    <div
      className={`rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 ${getStatusColor(booking)}`}
    >
      {/* Card Header */}
      <div className='p-4 pt-6 flex justify-between items-center border-b border-gray-100'>
        <div className='flex items-center gap-2'>
          {getStatusIcon(booking)}
          <div className='relative group'>
            <div className='flex items-center gap-1 cursor-pointer'>
              <span className='text-sm font-medium text-gray-600'>#{truncateId(booking.bookingId)}</span>
              <Copy
                className='h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(booking.bookingId)
                }}
              />
            </div>
            <div className='absolute -top-6 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md'>
              {booking.bookingId}
            </div>
          </div>
        </div>
        {getStatusBadgeContrast(booking)}
      </div>

      {/* Card Content */}
      <div className='p-4 bg-white'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-blue-500' />
            <span className='text-sm'>{formattedDate}</span>
          </div>
          <div className='flex items-center gap-2'>
            <CreditCard className={`h-4 w-4 ${booking.hasPayment ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm font-medium ${booking.hasPayment ? 'text-green-600' : 'text-red-500'}`}>
              {booking.hasPayment ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </span>
          </div>
        </div>

        {/* Services List - Conditional */}
        {hasServices && (
          <div className='mb-3 pt-2 border-t border-gray-100'>
            <p className='text-sm font-medium text-gray-600 mb-2'>Dịch vụ đã đặt:</p>
            <ul className='space-y-1'>
              {services.map((service, idx) => (
                <li key={idx} className='text-sm flex items-center gap-2 p-1.5 rounded-md'>
                  <FileText className='h-3.5 w-3.5 text-blue-500 flex-shrink-0' />
                  <span className='text-gray-700 font-medium'>
                    {service.testServiceName || service.serviceName || 'Không có tên dịch vụ'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Payment Details */}
        <div className='pt-3 border-t border-gray-100 mt-1 space-y-2'>
          {booking.hasPayment && (
            <>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-500'>Số tiền:</span>
                <span className='font-medium'>{booking.paymentAmount?.toLocaleString()} VND</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-500'>Phương thức:</span>
                <span>{booking.paymentMethod || 'Không có'}</span>
              </div>
            </>
          )}
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-500'>Cập nhật:</span>
            <span>{formattedUpdateDate}</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className='bg-gray-50 p-3 flex justify-end items-center'>
        <div className='flex gap-2'>
          <Button
            size='sm'
            variant='outline'
            className='flex items-center gap-1 h-8 text-xs border-blue-200 hover:bg-blue-50 hover:border-blue-300'
            onClick={() => navigate(`/customer/booking/${booking.bookingId}`)}
          >
            <Eye className='h-3.5 w-3.5 text-blue-500' />
            Chi tiết
          </Button>
          <Button
            size='sm'
            variant='outline'
            className={`flex items-center gap-1 h-8 text-xs ${
              booking.hasPayment
                ? 'border-green-200 hover:bg-green-50 hover:border-green-300'
                : 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300 text-red-500'
            }`}
            onClick={() =>
              booking.hasPayment ? handleShowPayment(booking.bookingId) : handleRepayment(booking.bookingId)
            }
          >
            <CreditCard className={`h-3.5 w-3.5 ${!booking.hasPayment && 'text-red-500'}`} />
            Thanh toán
          </Button>
        </div>
      </div>
    </div>
  )
}

const CustomerDashboard = () => {
  const user = useSelector((state) => state.user?.userInfo)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    loading: false,
    data: null,
    error: null,
    bookingId: null
  })

  // State to store booking details with test services
  const [bookingServices, setBookingServices] = useState({})

  // Consultation booking states
  const [consultationBookings, setConsultationBookings] = useState([])
  const [loadingConsultations, setLoadingConsultations] = useState(true)
  const [consultationError, setConsultationError] = useState(null)

  // Function to fetch booking details with test services
  const fetchBookingDetails = async (bookingId) => {
    try {
      const res = await api.get(`/api/booking-details/booking/${bookingId}`)
      const details = res.data

      // Transform the data to include service names
      if (Array.isArray(details) && details.length > 0) {
        return details.map((detail) => ({
          ...detail,
          testServiceName: detail.testServiceName || detail.serviceName || 'Không có tên dịch vụ'
        }))
      }
      return []
    } catch (err) {
      console.error(`Error fetching details for booking ${bookingId}:`, err)
      return []
    }
  }

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !user.accountId) return
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/api/bookings/account/${user.accountId}`)
        setBookings(res.data)

        // Fetch test services for each booking
        const servicesData = {}
        for (const booking of res.data) {
          const details = await fetchBookingDetails(booking.bookingId)
          console.log(`Services for booking ${booking.bookingId}:`, details)
          servicesData[booking.bookingId] = details
        }
        console.log('All booking services:', servicesData)
        setBookingServices(servicesData)
      } catch (err) {
        setError('Lỗi khi tải dữ liệu lịch hẹn.')
      } finally {
        setLoading(false)
      }
    }

    const fetchConsultationBookings = async () => {
      if (!user || !user.accountId) return
      setLoadingConsultations(true)
      setConsultationError(null)
      try {
        const res = await api.get(`/api/ConsultationBooking/${user.accountId}`)
        setConsultationBookings(res.data)
      } catch (err) {
        setConsultationError('Lỗi khi tải dữ liệu lịch hẹn tư vấn.')
      } finally {
        setLoadingConsultations(false)
      }
    }

    fetchBookings()
    fetchConsultationBookings()
  }, [user])

  const getStatusIcon = (booking) => {
    const icons = {
      unpaid: <AlertCircle className='h-5 w-5 text-red-500' />,
      'chờ xác nhận': <Clock className='h-5 w-5 text-yellow-500' />,
      'đã xác nhận': <Calendar className='h-5 w-5 text-blue-500' />,
      'hoàn thành': <CheckCircle className='h-5 w-5 text-green-500' />,
      'đã hủy': <AlertCircle className='h-5 w-5 text-gray-500' />,
      default: <AlertCircle className='h-5 w-5 text-gray-500' />
    }

    return !booking.hasPayment ? icons.unpaid : icons[booking.status] || icons.default
  }

  const getStatusColor = (booking) => {
    const colors = {
      unpaid: 'border-l-red-500 bg-red-50',
      'chờ xác nhận': 'border-l-yellow-500 bg-yellow-50',
      'đã xác nhận': 'border-l-blue-500 bg-blue-50',
      'hoàn thành': 'border-l-green-500 bg-green-50',
      'đã hủy': 'border-l-gray-500 bg-gray-50',
      default: 'border-l-gray-500 bg-gray-50'
    }

    return !booking.hasPayment ? colors.unpaid : colors[booking.status] || colors.default
  }

  // Format date and time for consultation bookings
  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Get status badge for consultation bookings
  const getConsultationStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: 'bg-yellow-500',
        text: 'text-white',
        icon: <Clock className='h-4 w-4 mr-1' />,
        label: 'Chờ xác nhận'
      },
      confirmed: {
        bg: 'bg-blue-500',
        text: 'text-white',
        icon: <Calendar className='h-4 w-4 mr-1' />,
        label: 'Đã xác nhận'
      },
      cancelled: {
        bg: 'bg-red-500',
        text: 'text-white',
        icon: <AlertCircle className='h-4 w-4 mr-1' />,
        label: 'Đã hủy'
      },
      default: {
        bg: 'bg-gray-400',
        text: 'text-white',
        icon: <Clock className='h-4 w-4 mr-1' />,
        label: 'Chờ xác nhận'
      }
    }

    const config = statusConfig[status?.toLowerCase()] || statusConfig.default

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full font-semibold text-sm shadow ${config.bg} ${config.text}`}
      >
        {config.icon} {config.label}
      </span>
    )
  }

  const getStatusBadgeContrast = (booking) => {
    if (!booking.hasPayment) {
      return (
        <span className='inline-block px-3 py-1 rounded-full font-semibold text-sm shadow bg-red-500 text-white'>
          Chưa thanh toán
        </span>
      )
    }

    const statusStyles = {
      'chờ xác nhận': { bg: 'bg-yellow-500', text: 'text-white' },
      'đã hủy': { bg: 'bg-red-500', text: 'text-white' },
      'hoàn thành': { bg: 'bg-green-600', text: 'text-white' },
      'đã thanh toán': { bg: 'bg-blue-600', text: 'text-white' },
      default: { bg: 'bg-gray-400', text: 'text-white' }
    }

    const style = statusStyles[booking.status?.toLowerCase()] || statusStyles.default

    return (
      <span className={`inline-block px-3 py-1 rounded-full font-semibold text-sm shadow ${style.bg} ${style.text}`}>
        {booking.status}
      </span>
    )
  }

  // Prepare data for booking status pie chart
  const bookingStatusData = useMemo(() => {
    const paidCount = bookings.filter((b) => b.hasPayment).length
    const unpaidCount = bookings.filter((b) => !b.hasPayment).length
    const pendingCount = bookings.filter((b) => b.status?.toLowerCase() === 'chờ xác nhận').length

    return [
      { name: 'Đã thanh toán', value: paidCount, color: '#4ade80' }, // green
      { name: 'Chưa thanh toán', value: unpaidCount, color: '#f87171' }, // red
      { name: 'Chờ xác nhận', value: pendingCount, color: '#facc15' } // yellow
    ].filter((item) => item.value > 0) // Remove items with 0 value
  }, [bookings])

  // Prepare data for consultation booking status pie chart
  const consultationStatusData = useMemo(() => {
    const confirmedCount = consultationBookings.filter((b) => b.status === 'confirmed').length
    const pendingCount = consultationBookings.filter((b) => b.status === 'pending').length
    const cancelledCount = consultationBookings.filter((b) => b.status === 'cancelled').length

    return [
      { name: 'Đã xác nhận', value: confirmedCount, color: '#60a5fa' }, // blue
      { name: 'Chờ xác nhận', value: pendingCount, color: '#facc15' }, // yellow
      { name: 'Đã hủy', value: cancelledCount, color: '#f87171' } // red
    ].filter((item) => item.value > 0) // Remove items with 0 value
  }, [consultationBookings])

  if (!user || user.role !== 'Customer') {
    return <Navigate to='/login' replace />
  }

  // Custom pie chart label
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill='white'
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline='central'
        fontSize={12}
        fontWeight='bold'
      >
        {`${value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    )
  }

  // Handle case where there's only one status with 100%
  const renderSingleValueLabel = ({ name, value }) => {
    return (
      <text x='50%' y='50%' textAnchor='middle' dominantBaseline='middle' fill='#333' fontSize={14} fontWeight='bold'>
        {`${name}: ${value} (100%)`}
      </text>
    )
  }

  // Custom tooltip for pie charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-2 border border-gray-200 rounded shadow-md'>
          <p className='font-medium'>{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className='text-gray-600'>{`${(payload[0].payload.percent * 100).toFixed(1)}%`}</p>
        </div>
      )
    }
    return null
  }

  // Handle cancel consultation booking
  const handleCancelConsultation = async (bookingId) => {
    if (!confirm('Bạn có chắc chắn muốn hủy lịch hẹn tư vấn này?')) return

    try {
      await api.patch(`/api/ConsultationBooking/${bookingId}/status`, JSON.stringify('cancelled'), {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Update the state locally
      setConsultationBookings((prevBookings) =>
        prevBookings.map((booking) => (booking.bookingId === bookingId ? { ...booking, status: 'cancelled' } : booking))
      )

      alert('Hủy lịch hẹn tư vấn thành công')
    } catch (err) {
      alert('Không thể hủy lịch hẹn tư vấn. Vui lòng thử lại sau.')
    }
  }

  const handleShowPayment = async (bookingId) => {
    setPaymentModal({ open: true, loading: true, data: null, error: null, bookingId })
    try {
      const res = await api.get(`/api/payments/booking/${bookingId}`)
      setPaymentModal({ open: true, loading: false, data: res.data, error: null, bookingId })
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setPaymentModal({ open: true, loading: false, data: null, error: 'Bạn chưa thanh toán đơn này.', bookingId })
      } else {
        setPaymentModal({
          open: true,
          loading: false,
          data: null,
          error: 'Không thể tải thông tin thanh toán.',
          bookingId
        })
      }
    }
  }

  // Hàm thanh toán lại
  const handleRepayment = async (bookingId) => {
    try {
      // Lấy tổng tiền và số dịch vụ
      const totalRes = await api.get(`/api/booking-details/booking/${bookingId}/total`)
      const { totalAmount } = totalRes.data
      if (!totalAmount || totalAmount <= 0) {
        alert('Không có dịch vụ nào để thanh toán!')
        return
      }
      // Gọi API tạo link thanh toán
      const res = await api.post('/api/payments/create-vnpay-url', {
        bookingId,
        amount: totalAmount,
        orderDescription: 'Xét Nghiệm STis',
        orderType: 'Xét Nghiệm'
      })

      if (res.data && typeof res.data === 'string') {
        window.location.href = res.data
      } else if (res.data && res.data.url) {
        window.location.href = res.data.url
      } else {
        alert('Không nhận được link thanh toán!')
      }
    } catch (err) {
      alert('Tạo link thanh toán thất bại!')
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-pink-50 to-pink-100'>
      <Navigation />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header with gradient background */}
        <div className='mb-10 p-6 rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 shadow-lg'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner'>
                <User className='w-10 h-10 text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white '>
                  Xin chào, <span className='gradient-text'>{user.fullName}</span>
                </h1>
                <p className='text-blue-100 text-sm mt-1'>Quản lý lịch hẹn và kết quả xét nghiệm của bạn</p>
              </div>
            </div>
            <div className='flex gap-3'>
              <Button
                className='bg-white/90 hover:bg-white text-blue-600 shadow-lg px-6 py-2 rounded-lg font-semibold text-base hover:scale-105 transition-transform'
                onClick={() => navigate('/booking')}
              >
                <Calendar className='h-4 w-4 mr-1' />
                Đặt lịch xét nghiệm
              </Button>
              <Button
                className='bg-blue-700/80 hover:bg-blue-700 text-white shadow-lg px-6 py-2 rounded-lg font-semibold text-base hover:scale-105 transition-transform border border-white/20'
                onClick={() => navigate('/booking-consultant')}
              >
                <MessageCircle className='h-4 w-4 mr-1' />
                Đặt lịch tư vấn
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Stats - Now with Pie Charts */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-10'>
          {/* Booking Status Pie Chart */}
          <Card className='border shadow-md transition-all duration-300 hover:shadow-xl'>
            <CardHeader>
              <CardTitle className='text-lg font-bold text-gray-700'>
                Tổng lịch hẹn xét nghiệm: {bookings.length}
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-2'>
              {loading ? (
                <div className='flex items-center justify-center h-64'>
                  <Loader className='animate-spin h-8 w-8 text-blue-500' />
                </div>
              ) : bookings.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-64'>
                  <Calendar className='h-16 w-16 text-gray-300 mb-4' />
                  <p className='text-gray-500'>Chưa có lịch hẹn xét nghiệm nào</p>
                </div>
              ) : (
                <div className='h-64'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={bookingStatusData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={bookingStatusData.length === 1 ? renderSingleValueLabel : renderCustomizedLabel}
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                      >
                        {bookingStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consultation Booking Status Pie Chart */}
          <Card className='border shadow-md transition-all duration-300 hover:shadow-xl'>
            <CardHeader>
              <CardTitle className='text-lg font-bold text-gray-700'>
                Tổng lịch tư vấn: {consultationBookings.length}
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-2'>
              {loadingConsultations ? (
                <div className='flex items-center justify-center h-64'>
                  <Loader className='animate-spin h-8 w-8 text-purple-500' />
                </div>
              ) : consultationBookings.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-64'>
                  <MessageCircle className='h-16 w-16 text-gray-300 mb-4' />
                  <p className='text-gray-500'>Chưa có lịch hẹn tư vấn nào</p>
                </div>
              ) : (
                <div className='h-64'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={consultationStatusData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={consultationStatusData.length === 1 ? renderSingleValueLabel : renderCustomizedLabel}
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                      >
                        {consultationStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bookings List with Tabs */}
        <Card className='shadow-lg border-0 mb-6 rounded-xl overflow-hidden'>
          <CardHeader className='bg-gradient-to-r from-gray-50 to-gray-100 border-b'>
            <CardTitle className='text-xl font-bold text-gray-900'>Lịch hẹn của tôi</CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <Tabs
              defaultActiveKey='test-bookings'
              className='p-4'
              tabBarStyle={{
                marginBottom: '16px',
                borderBottom: '1px solid #f0f0f0',
                padding: '0 16px'
              }}
            >
              <TabPane
                tab={
                  <span className='flex items-center gap-2 py-2'>
                    <FileText className='h-4 w-4 text-blue-500' />
                    <span>Xét nghiệm</span>
                  </span>
                }
                key='test-bookings'
                className='px-4'
              >
                {loading ? (
                  <div className='flex items-center gap-2 text-gray-500 p-8 justify-center'>
                    <Loader className='animate-spin' /> Đang tải dữ liệu...
                  </div>
                ) : error ? (
                  <div className='text-red-500 flex items-center gap-2 p-8 justify-center'>
                    <AlertCircle className='w-5 h-5' /> {error}
                  </div>
                ) : bookings.length === 0 ? (
                  <div className='text-center py-12 px-4 bg-gray-50 rounded-lg m-4'>
                    <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-500 mb-2'>Chưa có lịch hẹn xét nghiệm nào</p>
                    <p className='text-gray-400 text-sm mb-4'>Đặt lịch ngay để được chăm sóc sức khỏe tốt nhất</p>
                    <Button
                      className='mt-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg transition-shadow'
                      onClick={() => navigate('/booking')}
                    >
                      Đặt lịch xét nghiệm ngay
                    </Button>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4'>
                    {bookings.map((booking) => (
                      <BookingCard
                        key={booking.bookingId}
                        booking={booking}
                        navigate={navigate}
                        handleShowPayment={handleShowPayment}
                        handleRepayment={handleRepayment}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                        getStatusBadgeContrast={getStatusBadgeContrast}
                        bookingServices={bookingServices}
                      />
                    ))}
                  </div>
                )}
              </TabPane>
              <TabPane
                tab={
                  <span className='flex items-center gap-2 py-2'>
                    <MessageCircle className='h-4 w-4 text-purple-500' />
                    <span>Tư vấn</span>
                  </span>
                }
                key='consultation-bookings'
                className='px-4'
              >
                {loadingConsultations ? (
                  <div className='flex items-center gap-2 text-gray-500 p-8 justify-center'>
                    <Loader className='animate-spin' /> Đang tải dữ liệu lịch hẹn tư vấn...
                  </div>
                ) : consultationError ? (
                  <div className='text-red-500 flex items-center gap-2 p-8 justify-center'>
                    <AlertCircle className='w-5 h-5' /> {consultationError}
                  </div>
                ) : consultationBookings.length === 0 ? (
                  <div className='text-center py-12 px-4 bg-gray-50 rounded-lg m-4'>
                    <MessageCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-500 mb-2'>Chưa có lịch hẹn tư vấn nào</p>
                    <p className='text-gray-400 text-sm mb-4'>
                      Đặt lịch tư vấn để được tư vấn sức khỏe cùng chuyên gia
                    </p>
                    <Button
                      className='mt-2 bg-gradient-to-r from-purple-500 to-pink-400 text-white hover:shadow-lg transition-shadow'
                      onClick={() => navigate('/booking-consultant')}
                    >
                      Đặt lịch tư vấn ngay
                    </Button>
                  </div>
                ) : (
                  <div className='relative pl-8 border-l-2 border-purple-200 py-2'>
                    {consultationBookings.map((booking, index) => (
                      <div key={booking.bookingId} className='mb-8 relative'>
                        {/* Timeline dot */}
                        <div className='absolute -left-4 w-6 h-6 rounded-full flex items-center justify-center bg-purple-100 border-2 border-purple-300'>
                          <MessageCircle className='h-3 w-3 text-purple-600' />
                        </div>

                        {/* Card */}
                        <div
                          className={`ml-6 rounded-lg overflow-hidden shadow-md border ${
                            booking.status === 'confirmed'
                              ? 'border-blue-100'
                              : booking.status === 'cancelled'
                                ? 'border-red-100'
                                : 'border-yellow-100'
                          }`}
                        >
                          <div
                            className={`p-3 pt-6 flex justify-between items-center border-b ${
                              booking.status === 'confirmed'
                                ? 'bg-blue-50 border-blue-100'
                                : booking.status === 'cancelled'
                                  ? 'bg-red-50 border-red-100'
                                  : 'bg-yellow-50 border-yellow-100'
                            }`}
                          >
                            <div className='flex items-center gap-2'>
                              <div className='relative group'>
                                <div className='flex items-center gap-1'>
                                  <span className='text-sm font-medium text-purple-800'>
                                    #{truncateId(booking.bookingId, 6)}
                                  </span>
                                  <Copy
                                    className='h-3.5 w-3.5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
                                    onClick={() => copyToClipboard(booking.bookingId)}
                                  />
                                </div>
                                <div className='absolute -top-6 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md'>
                                  {booking.bookingId}
                                </div>
                              </div>
                            </div>
                            <div>{getConsultationStatusBadge(booking.status)}</div>
                          </div>

                          <div
                            className={`p-4 ${
                              booking.status === 'confirmed'
                                ? 'bg-blue-50'
                                : booking.status === 'cancelled'
                                  ? 'bg-red-50'
                                  : 'bg-yellow-50'
                            }`}
                          >
                            {/* Thông tin thời gian và chuyên viên - hiển thị theo cột thay vì hàng */}
                            <div className='grid grid-cols-1 gap-2 mb-3'>
                              <div className='flex items-center gap-2'>
                                <Calendar className='h-4 w-4 text-purple-500' />
                                <span className='text-sm font-medium'>
                                  Ngày hẹn: {formatDateTime(booking.scheduledAt).date}
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Clock className='h-4 w-4 text-purple-500' />
                                <span className='text-sm font-medium'>
                                  Giờ hẹn: {formatDateTime(booking.scheduledAt).time}
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <User className='h-4 w-4 text-purple-500' />
                                <span className='text-sm'>Chuyên viên: {booking.staffName || 'Chưa phân công'}</span>
                              </div>
                            </div>

                            {/* Thông tin chi tiết - luôn hiển thị */}
                            <div className='pt-3 border-t border-gray-100 mt-1 space-y-3'>
                              {/* Ngày tạo */}
                              <div className='flex items-center justify-between text-sm'>
                                <span className='text-gray-500'>Ngày tạo:</span>
                                <span>{new Date(booking.createdAt).toLocaleDateString('vi-VN')}</span>
                              </div>

                              {/* Loại tư vấn */}
                              <div className='flex items-center justify-between text-sm'>
                                <span className='text-gray-500'>Loại tư vấn:</span>
                                <span>{booking.consultationType || 'Tư vấn chung'}</span>
                              </div>

                              {/* Trạng thái */}
                              <div className='flex items-center justify-between text-sm'>
                                <span className='text-gray-500'>Trạng thái:</span>
                                <span
                                  className={`${
                                    booking.status === 'confirmed'
                                      ? 'text-blue-600'
                                      : booking.status === 'cancelled'
                                        ? 'text-red-500'
                                        : 'text-yellow-500'
                                  } font-medium`}
                                >
                                  {booking.status === 'pending'
                                    ? 'Chờ xác nhận'
                                    : booking.status === 'confirmed'
                                      ? 'Đã xác nhận'
                                      : booking.status === 'cancelled'
                                        ? 'Đã hủy'
                                        : booking.status}
                                </span>
                              </div>

                              {/* Nội dung tin nhắn */}
                              <div className='pt-2'>
                                <p className='text-sm font-medium text-gray-500 mb-1'>Nội dung:</p>
                                <p className='text-sm bg-purple-50 p-3 rounded-md border border-purple-100'>
                                  {booking.message || 'Không có nội dung'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div
                            className={`p-3 flex justify-end ${
                              booking.status === 'confirmed'
                                ? 'bg-blue-50'
                                : booking.status === 'cancelled'
                                  ? 'bg-red-50'
                                  : 'bg-yellow-50'
                            }`}
                          >
                            {booking.status === 'pending' && (
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-7 text-xs border-red-200 bg-white text-red-500 hover:bg-red-50'
                                onClick={() => handleCancelConsultation(booking.bookingId)}
                              >
                                <AlertCircle className='h-3 w-3 mr-1' />
                                Hủy lịch
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabPane>
            </Tabs>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        <Dialog open={paymentModal.open} onOpenChange={(open) => setPaymentModal((s) => ({ ...s, open }))}>
          <DialogContent className='max-w-lg'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5 text-green-500' />
                <span>Thanh toán</span>
              </DialogTitle>
            </DialogHeader>
            {paymentModal.loading ? (
              <div className='flex items-center gap-2 text-gray-500 p-8 justify-center'>
                <Loader className='animate-spin' /> Đang tải dữ liệu thanh toán...
              </div>
            ) : paymentModal.error ? (
              <div className='text-red-500 flex items-center gap-2 p-8 justify-center'>
                <AlertCircle className='w-5 h-5' /> {paymentModal.error}
              </div>
            ) : paymentModal.data ? (
              <div className='p-4 space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-500'>Số tiền:</span>
                  <span className='font-medium'>{paymentModal.data.amount?.toLocaleString()} VND</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-500'>Phương thức:</span>
                  <span>{paymentModal.data.paymentMethod || 'Không có'}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-500'>Trạng thái:</span>
                  <span
                    className={`font-medium ${paymentModal.data.status === 'paid' ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {paymentModal.data.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-500'>Ngày thanh toán:</span>
                  <span>{new Date(paymentModal.data.paymentDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-500'>Ngày tạo:</span>
                  <span>{new Date(paymentModal.data.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            ) : null}
            <div className='flex justify-end mt-4'>
              <Button
                onClick={() => setPaymentModal((s) => ({ ...s, open: false }))}
                className='bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg transition-shadow'
              >
                Đóng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default CustomerDashboard
