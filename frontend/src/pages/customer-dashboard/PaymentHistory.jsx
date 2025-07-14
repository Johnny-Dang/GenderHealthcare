import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Loader,
  AlertCircle,
  Calendar,
  Clock,
  User,
  CreditCard,
  FileText,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navigation from '@/components/Navigation'
import api from '@/configs/axios'
import { useSelector } from 'react-redux'

const PaymentHistory = () => {
  const [groupedPayments, setGroupedPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedBookings, setExpandedBookings] = useState(new Set())
  const navigate = useNavigate()
  const user = useSelector((state) => state.user?.userInfo)

  useEffect(() => {
    fetchPaymentHistory()
  }, [])

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/api/booking-details/paid/account/${user.accountId}`)

      const paymentsData = response?.data
      if (Array.isArray(paymentsData)) {
        // Group payments by bookingId
        const grouped = groupPaymentsByBooking(paymentsData)
        setGroupedPayments(grouped)
      } else {
        console.warn('Payments data is not an array:', paymentsData)
        setGroupedPayments([])
      }
    } catch (error) {
      console.error('Error fetching payment history:', error)

      if (error.response?.status === 404) {
        setError('Không tìm thấy lịch sử thanh toán')
        setGroupedPayments([])
      } else if (error.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn')
      } else {
        setError('Không thể tải lịch sử thanh toán. Vui lòng thử lại.')
      }
      setGroupedPayments([])
    } finally {
      setLoading(false)
    }
  }

  const groupPaymentsByBooking = (payments) => {
    const grouped = {}

    payments.forEach((payment) => {
      const bookingId = payment.bookingId
      if (!grouped[bookingId]) {
        grouped[bookingId] = {
          bookingId,
          createAt: payment.createAt || payment.slotDate,
          totalAmount: 0,
          totalServices: 0,
          services: []
        }
      }

      grouped[bookingId].services.push(payment)
      grouped[bookingId].totalAmount += payment.price || 0
      grouped[bookingId].totalServices += 1
    })

    // Convert to array and sort by date (newest first)
    return Object.values(grouped).sort((a, b) => new Date(b.createAt) - new Date(a.createAt))
  }

  const toggleExpanded = (bookingId) => {
    const newExpanded = new Set(expandedBookings)
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId)
    } else {
      newExpanded.add(bookingId)
    }
    setExpandedBookings(newExpanded)
  }

  const truncateId = (id, length = 8) => {
    if (!id) return ''
    return id.toString().length > length ? id.toString().substring(0, length) + '...' : id.toString()
  }

  const getShiftTime = (shift) => {
    return shift === 'AM' ? 'Sáng (7:30 - 12:00)' : 'Chiều (13:30 - 17:30)'
  }

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Có thể thêm toast notification ở đây thay vì alert
        const toast = document.createElement('div')
        toast.textContent = 'Đã sao chép!'
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50'
        document.body.appendChild(toast)
        setTimeout(() => document.body.removeChild(toast), 2000)
      })
      .catch((err) => {
        console.error('Không thể sao chép: ', err)
      })
  }

  // Calculate totals
  const totalBookings = groupedPayments.length
  const totalServices = groupedPayments.reduce((sum, booking) => sum + booking.totalServices, 0)
  const totalAmount = groupedPayments.reduce((sum, booking) => sum + booking.totalAmount, 0)

  return (
    <div className='min-h-screen bg-gradient-to-b from-pink-50 to-pink-100'>
      <Navigation />
      <div className='max-w-5xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button onClick={() => navigate('/')} variant='outline' className='flex items-center gap-2'>
              <ArrowLeft size={16} />
              Quay lại
            </Button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Lịch sử thanh toán</h1>
              <p className='text-gray-600'>Xem các đơn hàng và dịch vụ đã thanh toán</p>
            </div>
          </div>

          <Button
            onClick={fetchPaymentHistory}
            variant='outline'
            size='sm'
            disabled={loading}
            className='border-primary-500 text-primary-500 hover:bg-primary-50'
          >
            {loading ? <Loader className='animate-spin h-4 w-4' /> : 'Làm mới'}
          </Button>
        </div>

        {/* Payment List */}
        <div className='space-y-6'>
          {loading ? (
            <Card className='p-8'>
              <div className='flex items-center justify-center'>
                <Loader className='animate-spin h-6 w-6 mr-2 text-primary-500' />
                <span>Đang tải dữ liệu...</span>
              </div>
            </Card>
          ) : error ? (
            <Card className='p-8'>
              <div className='text-center text-red-500'>
                <AlertCircle className='h-12 w-12 mx-auto mb-4' />
                <p className='mb-4'>{error}</p>
                <Button onClick={fetchPaymentHistory} variant='outline'>
                  Thử lại
                </Button>
              </div>
            </Card>
          ) : groupedPayments.length === 0 ? (
            <Card className='p-8'>
              <div className='text-center text-gray-500'>
                <CreditCard className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                <p className='mb-4'>Chưa có đơn hàng thanh toán nào</p>
                <Button
                  onClick={() => navigate('/test-service')}
                  className='bg-gradient-primary hover:opacity-90 text-white'
                >
                  Đặt dịch vụ ngay
                </Button>
              </div>
            </Card>
          ) : (
            groupedPayments.map((booking) => {
              const isExpanded = expandedBookings.has(booking.bookingId)

              return (
                <Card
                  key={booking.bookingId}
                  className='border shadow-sm hover:shadow-md transition-shadow overflow-hidden'
                >
                  {/* Booking Header */}
                  <div className='bg-gradient-to-r from-primary-50 to-blue-50 p-4 border-b'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-white rounded-full shadow-sm'>
                          <CreditCard className='h-5 w-5 text-primary-500' />
                        </div>
                        <div>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-bold text-gray-900'>Đơn hàng #{truncateId(booking.bookingId, 10)}</h3>
                            <Copy
                              className='h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors'
                              onClick={() => copyToClipboard(booking.bookingId)}
                            />
                            {/* Thêm Badge "Đã thanh toán" ở đây */}
                            <Badge className='bg-green-100 text-green-800'>Đã thanh toán</Badge>
                          </div>
                          <p className='text-sm text-gray-600'>
                            {booking.totalServices} dịch vụ • {new Date(booking.createAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <div className='text-right'>
                          <p className='text-sm text-gray-600'>Tổng thanh toán</p>
                          <p className='font-bold text-lg text-green-600'>{booking.totalAmount.toLocaleString()} VND</p>
                        </div>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => toggleExpanded(booking.bookingId)}
                          className='ml-2'
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp size={16} className='mr-1' />
                              Thu gọn
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} className='mr-1' />
                              Chi tiết
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Services List - Expandable */}
                  {isExpanded && (
                    <CardContent className='p-0'>
                      <div className='divide-y divide-gray-100'>
                        {booking.services.map((service, index) => (
                          <div key={service.bookingDetailId} className='p-4 hover:bg-gray-50 transition-colors'>
                            <div className='flex items-start justify-between mb-3'>
                              <div className='flex items-center gap-3'>
                                <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                                  <span className='text-sm font-medium text-blue-600'>{index + 1}</span>
                                </div>
                                <div>
                                  <h4 className='font-semibold text-gray-900'>{service.serviceName}</h4>
                                  <p className='text-sm text-gray-500'>#{truncateId(service.bookingDetailId, 8)}</p>
                                </div>
                              </div>
                              <div className='text-right'>
                                <p className='font-bold text-green-600'>{service.price?.toLocaleString()} VND</p>
                              </div>
                            </div>

                            {/* Service Details */}
                            <div className='grid md:grid-cols-2 gap-4 mb-4 ml-11'>
                              <div className='flex items-center gap-2'>
                                <Calendar className='h-4 w-4 text-primary-500' />
                                <div>
                                  <p className='text-xs text-gray-500'>Ngày sử dụng</p>
                                  <p className='text-sm font-medium'>
                                    {new Date(service.slotDate).toLocaleDateString('vi-VN')}
                                  </p>
                                </div>
                              </div>
                              <div className='flex items-center gap-2'>
                                <Clock className='h-4 w-4 text-primary-500' />
                                <div>
                                  <p className='text-xs text-gray-500'>Ca sử dụng</p>
                                  <p className='text-sm font-medium'>{getShiftTime(service.slotShift)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Customer Info */}
                            <div className='ml-11 p-3 bg-gray-50 rounded-lg'>
                              <div className='flex items-center gap-2 mb-2'>
                                <User className='h-4 w-4 text-primary-500' />
                                <span className='text-sm font-medium text-gray-700'>Thông tin khách hàng</span>
                              </div>
                              <div className='grid md:grid-cols-2 gap-3 text-sm'>
                                <div>
                                  <span className='text-gray-500'>Tên:</span>
                                  <span className='ml-2 font-medium'>
                                    {service.firstName} {service.lastName}
                                  </span>
                                </div>
                                <div>
                                  <span className='text-gray-500'>SĐT:</span>
                                  <span className='ml-2 font-medium'>{service.phone}</span>
                                </div>
                                <div>
                                  <span className='text-gray-500'>Ngày sinh:</span>
                                  <span className='ml-2 font-medium'>
                                    {new Date(service.dateOfBirth).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                                <div>
                                  <span className='text-gray-500'>Giới tính:</span>
                                  <span className='ml-2 font-medium'>{service.gender ? 'Nam' : 'Nữ'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })
          )}
        </div>

        {/* Summary */}
        {totalBookings > 0 && (
          <Card className='mt-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200'>
            <CardContent className='p-6'>
              <h3 className='text-lg font-bold text-gray-900 mb-4 text-center'>Tổng kết thanh toán</h3>
              <div className='grid md:grid-cols-3 gap-6'>
                <div className='text-center'>
                  <div className='p-4 bg-white rounded-lg shadow-sm'>
                    <CreditCard className='h-8 w-8 text-primary-500 mx-auto mb-2' />
                    <p className='text-sm text-gray-600'>Tổng đơn hàng</p>
                    <p className='text-2xl font-bold text-primary-600'>{totalBookings}</p>
                  </div>
                </div>
                <div className='text-center'>
                  <div className='p-4 bg-white rounded-lg shadow-sm'>
                    <FileText className='h-8 w-8 text-blue-500 mx-auto mb-2' />
                    <p className='text-sm text-gray-600'>Tổng dịch vụ</p>
                    <p className='text-2xl font-bold text-blue-600'>{totalServices}</p>
                  </div>
                </div>
                <div className='text-center'>
                  <div className='p-4 bg-white rounded-lg shadow-sm'>
                    <CreditCard className='h-8 w-8 text-green-500 mx-auto mb-2' />
                    <p className='text-sm text-gray-600'>Tổng số tiền</p>
                    <p className='text-2xl font-bold text-green-600'>{totalAmount.toLocaleString()} VND</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default PaymentHistory
