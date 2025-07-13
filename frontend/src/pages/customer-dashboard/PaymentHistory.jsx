import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Receipt, Loader, AlertCircle, Calendar, Clock, User, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navigation from '@/components/Navigation'
import api from '@/configs/axios'
import { useSelector } from 'react-redux'

const PaymentHistory = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
      setPayments(response.data || [])
    } catch (error) {
      console.error('Error fetching payment history:', error)

      if (error.response?.status === 404) {
        setError('Không tìm thấy lịch sử thanh toán')
        setPayments([])
      } else if (error.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn')
      } else {
        setError('Không thể tải lịch sử thanh toán. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    return <Badge className='bg-green-100 text-green-800'>Đã thanh toán</Badge>
  }

  // Function để truncate ID
  const truncateId = (id, length = 8) => {
    if (!id) return ''
    return id.toString().length > length ? id.toString().substring(0, length) + '...' : id.toString()
  }

  // Function để hiển thị thời gian ca
  const getShiftTime = (shift) => {
    return shift === 'AM' ? 'Sáng (7:30 - 12:00)' : 'Chiều (13:30 - 17:30)'
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-pink-50 to-pink-100'>
      <Navigation />
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button onClick={() => navigate('/')} variant='outline' className='flex items-center gap-2'>
              <ArrowLeft size={16} />
              Quay lại
            </Button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Lịch sử thanh toán</h1>
              <p className='text-gray-600'>Xem các dịch vụ đã thanh toán</p>
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
        <div className='space-y-4'>
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
          ) : payments.length === 0 ? (
            <Card className='p-8'>
              <div className='text-center text-gray-500'>
                <CreditCard className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                <p className='mb-4'>Chưa có giao dịch thanh toán nào</p>
                <Button
                  onClick={() => navigate('/test-service')}
                  className='bg-gradient-primary hover:opacity-90 text-white'
                >
                  Đặt dịch vụ ngay
                </Button>
              </div>
            </Card>
          ) : (
            payments.map((payment) => (
              <Card key={payment.bookingDetailId} className='border shadow-sm hover:shadow-md transition-shadow'>
                <CardContent className='p-6'>
                  {/* Header */}
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <CreditCard className='h-5 w-5 text-primary-500' />
                      <span className='font-medium text-gray-900'>#{truncateId(payment.bookingDetailId, 8)}</span>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>

                  {/* Service Name */}
                  <div className='mb-4'>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>{payment.serviceName}</h3>
                  </div>

                  {/* Payment Amount */}
                  <div className='mb-4 p-4 bg-green-50 rounded-lg border border-green-200'>
                    <div className='text-center'>
                      <p className='text-sm text-gray-600 mb-1'>Số tiền đã thanh toán</p>
                      <p className='text-2xl font-bold text-green-600'>{payment.price?.toLocaleString()} VND</p>
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className='grid md:grid-cols-2 gap-4 mb-4'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-primary-500' />
                      <div>
                        <p className='text-sm text-gray-500'>Ngày sử dụng</p>
                        <p className='font-medium'>{new Date(payment.slotDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-primary-500' />
                      <div>
                        <p className='text-sm text-gray-500'>Ca sử dụng</p>
                        <p className='font-medium'>{getShiftTime(payment.slotShift)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className='p-3 bg-gray-50 rounded-lg'>
                    <div className='flex items-center gap-2 mb-3'>
                      <User className='h-4 w-4 text-primary-500' />
                      <span className='font-medium text-gray-700'>Thông tin khách hàng</span>
                    </div>
                    <div className='grid md:grid-cols-2 gap-3 text-sm'>
                      <div>
                        <span className='text-gray-500'>Tên:</span>
                        <span className='ml-2 font-medium'>
                          {payment.firstName} {payment.lastName}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-500'>SĐT:</span>
                        <span className='ml-2 font-medium'>{payment.phone}</span>
                      </div>
                      <div>
                        <span className='text-gray-500'>Ngày sinh:</span>
                        <span className='ml-2 font-medium'>
                          {new Date(payment.dateOfBirth).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-500'>Giới tính:</span>
                        <span className='ml-2 font-medium'>{payment.gender ? 'Nam' : 'Nữ'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        {payments.length > 0 && (
          <Card className='mt-6 bg-primary-50 border-primary-200'>
            <CardContent className='p-4 text-center'>
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600'>Tổng giao dịch</p>
                  <p className='text-lg font-bold text-primary-600'>{payments.length}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Tổng số tiền</p>
                  <p className='text-lg font-bold text-green-600'>
                    {payments.reduce((total, payment) => total + (payment.price || 0), 0).toLocaleString()} VND
                  </p>
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
