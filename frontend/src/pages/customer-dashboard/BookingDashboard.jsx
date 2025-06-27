import React, { useState, useEffect } from 'react'
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
  CreditCard
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import { useSelector } from 'react-redux'
import api from '@/configs/axios'

const CustomerDashboard = () => {
  const user = useSelector((state) => state.user.userInfo)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const [paymentModal, setPaymentModal] = useState({ open: false, loading: false, data: null, error: null, bookingId: null })

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_payment':
        return <AlertCircle className='h-5 w-5 text-red-500' />
      case 'paid':
        return <Clock className='h-5 w-5 text-yellow-500' />
      case 'confirmed':
        return <Calendar className='h-5 w-5 text-blue-500' />
      case 'completed':
        return <CheckCircle className='h-5 w-5 text-green-500' />
      default:
        return <AlertCircle className='h-5 w-5 text-gray-500' />
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending_payment: 'border-l-red-500 bg-red-50',
      paid: 'border-l-yellow-500 bg-yellow-50',
      confirmed: 'border-l-blue-500 bg-blue-50',
      completed: 'border-l-green-500 bg-green-50',
      cancelled: 'border-l-gray-500 bg-gray-50'
    }
    return colors[status] || 'border-l-gray-500 bg-gray-50'
  }

  const handleShowPayment = async (bookingId) => {
    setPaymentModal({ open: true, loading: true, data: null, error: null, bookingId });
    try {
      const res = await api.get(`/api/payments/booking/${bookingId}`);
      setPaymentModal({ open: true, loading: false, data: res.data, error: null, bookingId });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setPaymentModal({ open: true, loading: false, data: null, error: 'Bạn chưa thanh toán đơn này.', bookingId });
      } else {
        setPaymentModal({ open: true, loading: false, data: null, error: 'Không thể tải thông tin thanh toán.', bookingId });
      }
    }
  };

  // Hàm thanh toán lại
  const handleRepayment = async (bookingId) => {
    try {
      // Lấy tổng tiền và số dịch vụ
      const totalRes = await api.get(`/api/booking-details/booking/${bookingId}/total`);
      const { totalAmount } = totalRes.data;
      if (!totalAmount || totalAmount <= 0) {
        alert('Không có dịch vụ nào để thanh toán!');
        return;
      }
      // Gọi API tạo link thanh toán
      const res = await api.post('/api/payments/create-vnpay-url', {
        bookingId,
        amount: totalAmount,
        orderDescription: 'Xét Nghiệm STis',
        orderType: 'Xét Nghiệm',
      });
      if (res.data && typeof res.data === 'string') {
        window.location.href = res.data;
      } else if (res.data && res.data.url) {
        window.location.href = res.data.url;
      } else {
        alert('Không nhận được link thanh toán!');
      }
    } catch (err) {
      alert('Tạo link thanh toán thất bại!');
    }
  };

  const getStatusBadgeContrast = (status) => {
    let bg = 'bg-gray-400', text = 'text-white', label = status;
    switch (status?.toLowerCase()) {
      case 'chờ xác nhận':
        bg = 'bg-yellow-500'; text = 'text-white'; break;
      case 'đã hủy':
        bg = 'bg-red-500'; text = 'text-white'; break;
      case 'hoàn thành':
        bg = 'bg-green-600'; text = 'text-white'; break;
      case 'đã thanh toán':
        bg = 'bg-blue-600'; text = 'text-white'; break;
      default:
        bg = 'bg-gray-400'; text = 'text-white'; break;
    }
    return (
      <span className={`inline-block px-3 py-1 rounded-full font-semibold text-sm shadow ${bg} ${text}`}>{label}</span>
    );
  };

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
        {/* Header với avatar, tên, nút đặt lịch mới */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4'>
          <div className='flex items-center gap-4'>
            <div className='w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center'>
              <User className='w-10 h-10 text-blue-500' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Xin chào, {user.name}</h1>
              <p className='text-gray-500 text-sm mt-1'>Quản lý lịch hẹn và kết quả xét nghiệm của bạn</p>
            </div>
          </div>
          <Button
            className='bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg px-6 py-2 rounded-lg font-semibold text-base hover:scale-105 transition-transform'
            onClick={() => navigate('/booking')}
          >
            Đặt lịch mới
          </Button>
        </div>

        {/* Dashboard Stats */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
          {dashboardStats.map((stat, index) => (
            <div
              key={index}
              className={`flex items-center p-5 rounded-2xl shadow-lg bg-white transition-transform duration-200 hover:scale-105 hover:shadow-2xl border-0 gap-4 relative overflow-hidden`}
            >
              {/* Vòng tròn icon với màu gradient riêng */}
              <div
                className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center shadow-md ${
                  index === 0
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                    : index === 1
                      ? 'bg-gradient-to-br from-green-400 to-green-600'
                      : index === 2
                        ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                        : 'bg-gradient-to-br from-yellow-300 to-yellow-500'
                }`}
              >
                <stat.icon className='w-8 h-8 text-white' />
              </div>
              {/* Số liệu và tiêu đề */}
              <div className='ml-2'>
                <div className='text-3xl font-extrabold text-gray-900 leading-tight'>{stat.value}</div>
                <div className='text-base font-medium text-gray-500 mt-1'>{stat.title}</div>
              </div>
              {/* Hiệu ứng nền mờ phía sau icon */}
              <div
                className={`absolute right-0 bottom-0 opacity-10 pointer-events-none select-none w-24 h-24 rounded-full ${
                  index === 0
                    ? 'bg-blue-400'
                    : index === 1
                      ? 'bg-green-400'
                      : index === 2
                        ? 'bg-purple-400'
                        : 'bg-yellow-300'
                }`}
              ></div>
            </div>
          ))}
        </div>

        {/* Bookings List - Card Layout thay vì bảng */}
        <Card className='shadow-md border-0'>
          <CardHeader>
            <CardTitle className='text-xl font-bold text-gray-900'>Lịch hẹn xét nghiệm của tôi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='flex items-center gap-2 text-gray-500'>
                <Loader className='animate-spin' /> Đang tải dữ liệu...
              </div>
            ) : error ? (
              <div className='text-red-500 flex items-center gap-2'>
                <AlertCircle className='w-5 h-5' /> {error}
              </div>
            ) : bookings.length === 0 ? (
              <div className='text-center py-8'>
                <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>Chưa có lịch hẹn nào</p>
                <Button
                  className='mt-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                  onClick={() => navigate('/booking')}
                >
                  Đặt lịch xét nghiệm ngay
                </Button>
              </div>
            ) : (
              <div className='grid gap-6'>
                {bookings.map((booking, index) => (
                  <div
                    key={booking.bookingId}
                    className={`p-6 rounded-xl border-l-4 shadow-lg hover:shadow-xl transition-all duration-300 ${getStatusColor(booking.status)}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                      {/* Thông tin chính */}
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-3'>
                          <div className='flex items-center gap-2'>
                            {getStatusIcon(booking.status)}
                            <span className='text-sm font-medium text-gray-600'>Mã đặt lịch: {booking.bookingId}</span>
                          </div>
                        </div>
                        
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                          <div className='flex items-center gap-2'>
                            <Calendar className='h-4 w-4 text-gray-500' />
                            <span className='text-sm text-gray-600'>Ngày tạo: {new Date(booking.createAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Clock className='h-4 w-4 text-gray-500' />
                            <span className='text-sm text-gray-600'>
                              Cập nhật: {booking.updateAt ? new Date(booking.updateAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge - Nổi bật */}
                      <div className='flex flex-col items-center gap-3'>
                        <div className='text-center'>
                          <div className='mb-2'>
                            {getStatusBadgeContrast(booking.status)}
                          </div>
                          <div className='text-xs text-gray-500 font-medium'>
                            Trạng thái hiện tại
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='flex flex-col sm:flex-row gap-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          className='flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300'
                          onClick={() => navigate(`/customer-dashboard/booking/${booking.bookingId}`)}
                        >
                          <Eye className='h-4 w-4' />
                          Chi tiết
                        </Button>
                        <Button 
                          size='sm' 
                          variant='secondary'
                          className='flex items-center gap-2 hover:bg-yellow-50 hover:border-yellow-300'
                          onClick={() => handleShowPayment(booking.bookingId)}
                        >
                          <CreditCard className='h-4 w-4' />
                          Lịch sử thanh toán
                        </Button>
                        {booking.status === 'pending_payment' && (
                          <Button
                            size='sm'
                            variant='destructive'
                            className='flex items-center gap-2 hover:bg-red-50 hover:border-red-300'
                            onClick={() => handleRepayment(booking.bookingId)}
                          >
                            <CreditCard className='h-4 w-4' />
                            Thanh toán lại
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={paymentModal.open} onOpenChange={(open) => setPaymentModal((s) => ({ ...s, open }))}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
          </DialogHeader>
          {paymentModal.loading ? (
            <div className='flex flex-col items-center py-8'>
              <Loader className='animate-spin mb-2 text-primary-500' />
              <span>Đang tải thông tin thanh toán...</span>
            </div>
          ) : paymentModal.error ? (
            <div className='text-center py-8'>
              <div className='text-red-500 mb-4'>{paymentModal.error}</div>
              {paymentModal.error === 'Bạn chưa thanh toán đơn này.' && (
                <Button
                  variant='destructive'
                  className='flex items-center gap-2 mx-auto'
                  onClick={() => handleRepayment(paymentModal.bookingId)}
                >
                  <CreditCard className='h-4 w-4' />
                  Thanh toán lại
                </Button>
              )}
            </div>
          ) : paymentModal.data ? (
            <div className='flex flex-col items-center py-6'>
              <div className='bg-green-100 rounded-full p-4 mb-4'>
                <CreditCard className='h-10 w-10 text-green-600' />
              </div>
              <div className='text-2xl font-bold text-green-700 mb-2'>Đã thanh toán</div>
              <div className='w-full max-w-md bg-gray-50 rounded-xl p-6 shadow space-y-4'>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-600'>Mã giao dịch:</span>
                  <span className='font-mono text-gray-800'>{paymentModal.data.transactionId}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-600'>Ngày thanh toán:</span>
                  <span>{paymentModal.data.createdAt ? new Date(paymentModal.data.createdAt).toLocaleString('vi-VN') : ''}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-600'>Số tiền:</span>
                  <span className='text-lg font-bold text-green-700'>{paymentModal.data.amount?.toLocaleString('vi-VN')} VND</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-600'>Phương thức:</span>
                  <span className='text-gray-800'>{paymentModal.data.paymentMethod}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className='text-gray-500 text-center py-8'>Không có dữ liệu thanh toán.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CustomerDashboard
