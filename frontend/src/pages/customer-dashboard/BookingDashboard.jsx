import React, { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
// import ServiceFeedback from '@/components/ServiceFeedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom'
import { Calendar, Clock, FileText, Download, MapPin, Phone, CheckCircle, AlertCircle, Star, User } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useSelector } from 'react-redux'
import api from '@/configs/axios'

const CustomerDashboard = () => {
  const user = useSelector((state) => state.user.userInfo)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !user.accountId) return
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/api/bookings/account/${user.accountId}`)
        setBookings(res.data)
      } catch (err) {
        setError('Lỗi khi tải dữ liệu lịch hẹn.')
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [user])

  if (!user || user.role !== 'Customer') {
    return <Navigate to='/login' replace />
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending_payment: { bg: 'bg-red-100', text: 'text-red-800', label: 'Chờ thanh toán' },
      paid: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đã thanh toán' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã xác nhận' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoàn thành' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã hủy' }
    }
    const variant = variants[status]
    return <Badge className={`${variant.bg} ${variant.text}`}>{variant.label}</Badge>
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_payment':
        return <AlertCircle className='h-4 w-4 text-red-500' />
      case 'paid':
        return <Clock className='h-4 w-4 text-yellow-500' />
      case 'confirmed':
        return <Calendar className='h-4 w-4 text-blue-500' />
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-500' />
      default:
        return <AlertCircle className='h-4 w-4 text-gray-500' />
    }
  }

  const handleDownloadResult = (booking) => {
    // TODO: Implement actual file download
    console.log('Downloading result for booking:', booking.id)
    // Simulate download
    const link = document.createElement('a')
    link.href = '#'
    link.download = booking.testResult?.fileName || 'test_result.pdf'
    link.click()
  }

  const handleFeedbackSubmitted = () => {
    setShowFeedback(false)
    // Update booking to mark feedback as given
    // TODO: Update via API
  }

  const dashboardStats = [
    {
      title: 'Tổng lịch hẹn',
      value: bookings.length.toString(),
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: 'Đã hoàn thành',
      value: bookings.filter((b) => b.status === 'completed').length.toString(),
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Kết quả có sẵn',
      value: bookings.filter((b) => b.testResult?.available).length.toString(),
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      title: 'Chờ xác nhận',
      value: bookings.filter((b) => ['paid', 'confirmed'].includes(b.status)).length.toString(),
      icon: Clock,
      color: 'text-yellow-600'
    }
  ]

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navigation />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Dashboard của tôi</h1>
          <p className='text-gray-600 mt-2'>Chào mừng {user.name}, quản lý lịch hẹn và kết quả xét nghiệm</p>
        </div>

        {/* Dashboard Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {dashboardStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>{stat.title}</p>
                    <p className='text-3xl font-bold text-gray-900'>{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch hẹn xét nghiệm của tôi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Đang tải dữ liệu...</div>
            ) : error ? (
              <div className='text-red-500'>{error}</div>
            ) : bookings.length === 0 ? (
              <div className='text-center py-8'>
                <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>Chưa có lịch hẹn nào</p>
                <Button className='mt-4 bg-gradient-primary'>Đặt lịch xét nghiệm ngay</Button>
              </div>
            ) : (
              <div className='space-y-4'>
                {bookings.map((booking) => (
                  <div key={booking.bookingId} className='border rounded-lg p-6 hover:shadow-md transition-shadow'>
                    <div className='mb-2'>
                      <span className='font-semibold'>Mã đặt lịch:</span> {booking.bookingId}
                    </div>
                    <div>
                      <span className='font-semibold'>AccountId:</span> {booking.accountId}
                    </div>
                    <div>
                      <span className='font-semibold'>Ngày tạo:</span> {booking.createAt}
                    </div>
                    <div>
                      <span className='font-semibold'>Cập nhật lần cuối:</span> {booking.updateAt || 'Chưa cập nhật'}
                    </div>
                    <div className='mt-4'>
                      <Button size='sm' onClick={() => navigate(`/customer-dashboard/booking/${booking.bookingId}`)}>
                        Xem chi tiết dịch vụ
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CustomerDashboard
