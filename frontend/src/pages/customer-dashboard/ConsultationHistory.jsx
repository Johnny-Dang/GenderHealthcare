import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MessageCircle, Calendar, Clock, User, Loader, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navigation from '@/components/Navigation'
import api from '@/configs/axios'
import { useSelector } from 'react-redux'

const ConsultationHistory = () => {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const user = useSelector((state) => state.user?.userInfo)

  useEffect(() => {
    fetchConsultationHistory()
  }, [])

  const fetchConsultationHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/api/ConsultationBooking/${user.accountId}`)

      // Kiểm tra response data
      if (response.data && Array.isArray(response.data)) {
        setConsultations(response.data)
      } else {
        setConsultations([])
      }
    } catch (error) {
      console.error('Error fetching consultation history:', error)

      if (error.response?.status === 404) {
        setError('Không tìm thấy dữ liệu tư vấn')
        setConsultations([])
      } else if (error.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn')
      } else {
        setError('Không thể tải lịch sử tư vấn. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge className='bg-blue-100 text-blue-800'>Đã xác nhận</Badge>
      case 'pending':
        return <Badge className='bg-yellow-100 text-yellow-800'>Chờ xác nhận</Badge>
      case 'completed':
        return <Badge className='bg-green-100 text-green-800'>Hoàn thành</Badge>
      case 'cancelled':
        return <Badge className='bg-red-100 text-red-800'>Đã hủy</Badge>
      default:
        return <Badge className='bg-gray-100 text-gray-800'>{status}</Badge>
    }
  }

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Hàm truncate bookingId để hiển thị ngắn gọn
  const truncateId = (id, length = 8) => {
    if (!id) return ''
    return id.toString().length > length ? id.toString().substring(0, length) + '...' : id.toString()
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-pink-50 to-pink-100'>
      <Navigation />
      <div className='max-w-6xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button onClick={() => navigate('/')} variant='outline' className='flex items-center gap-2'>
              <ArrowLeft size={16} />
              Quay lại
            </Button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Lịch sử tư vấn</h1>
              <p className='text-gray-600'>Xem tất cả buổi tư vấn đã thực hiện</p>
            </div>
          </div>

          {/* Nút refresh */}
          <Button onClick={fetchConsultationHistory} variant='outline' size='sm' disabled={loading}>
            {loading ? <Loader className='animate-spin h-4 w-4' /> : 'Làm mới'}
          </Button>
        </div>

        {/* Consultation List */}
        <div className='space-y-4'>
          {loading ? (
            <Card className='p-8'>
              <div className='flex items-center justify-center'>
                <Loader className='animate-spin h-6 w-6 mr-2' />
                Đang tải dữ liệu...
              </div>
            </Card>
          ) : error ? (
            <Card className='p-8'>
              <div className='text-center text-red-500'>
                <AlertCircle className='h-12 w-12 mx-auto mb-4' />
                <p>{error}</p>
                <Button onClick={fetchConsultationHistory} variant='outline' className='mt-4'>
                  Thử lại
                </Button>
              </div>
            </Card>
          ) : consultations.length === 0 ? (
            <Card className='p-8'>
              <div className='text-center text-gray-500'>
                <MessageCircle className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                <p>Chưa có buổi tư vấn nào</p>
                <Button
                  onClick={() => navigate('/booking-consultant')}
                  className='mt-4 bg-gradient-to-r from-purple-500 to-pink-400 text-white'
                >
                  Đặt lịch tư vấn ngay
                </Button>
              </div>
            </Card>
          ) : (
            consultations.map((consultation) => (
              <Card key={consultation.bookingId} className='border shadow-sm hover:shadow-md transition-shadow'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <MessageCircle className='h-5 w-5 text-purple-500' />
                      {/* Hiển thị bookingId rút gọn, có thể click để copy */}
                      <div className='relative group'>
                        <span className='font-medium cursor-pointer hover:text-purple-600'>
                          #{truncateId(consultation.bookingId, 8)}
                        </span>
                        <div className='absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10'>
                          {consultation.bookingId}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(consultation.status)}
                  </div>

                  <div className='grid md:grid-cols-2 gap-4 mb-4'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-purple-500' />
                      <div>
                        <p className='text-sm text-gray-500'>Ngày tư vấn</p>
                        <p className='font-semibold'>{formatDateTime(consultation.scheduledAt).date}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-purple-500' />
                      <div>
                        <p className='text-sm text-gray-500'>Giờ tư vấn</p>
                        <p className='font-semibold'>{formatDateTime(consultation.scheduledAt).time}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <User className='h-4 w-4 text-purple-500' />
                      <div>
                        <p className='text-sm text-gray-500'>Chuyên viên</p>
                        <p className='font-semibold'>{consultation.staffName || 'Chưa phân công'}</p>
                      </div>
                    </div>
                    {/* Xóa loại tư vấn vì API không có field này */}
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-purple-500' />
                      <div>
                        <p className='text-sm text-gray-500'>Ngày tạo</p>
                        <p className='font-semibold'>
                          {consultation.createdAt && consultation.createdAt !== '0001-01-01T00:00:00'
                            ? new Date(consultation.createdAt).toLocaleDateString('vi-VN')
                            : 'Không có thông tin'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hiển thị thông tin khách hàng */}
                  <div className='grid md:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg'>
                    <div>
                      <p className='text-sm text-gray-500'>Email</p>
                      <p className='text-sm font-medium'>{consultation.customerEmail}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Số điện thoại</p>
                      <p className='text-sm font-medium'>{consultation.customerPhone}</p>
                    </div>
                  </div>

                  {/* Nội dung tư vấn */}
                  {consultation.message && (
                    <div className='mt-4 pt-4 border-t'>
                      <p className='text-sm text-gray-500 mb-2'>Nội dung tư vấn:</p>
                      <p className='text-sm bg-purple-50 p-3 rounded-md border border-purple-100'>
                        {consultation.message}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ConsultationHistory
