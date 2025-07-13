import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Eye, Calendar, Loader, AlertCircle, Clock, User, Star, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navigation from '@/components/Navigation'
import api from '@/configs/axios'
import { useSelector } from 'react-redux'

const TestResultsHistory = () => {
  const [testResults, setTestResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reviewedServices, setReviewedServices] = useState(new Set()) // Lưu services đã đánh giá
  const [feedbackModal, setFeedbackModal] = useState({
    open: false,
    serviceId: null,
    serviceName: '',
    content: '',
    rating: 5,
    loading: false,
    resultUrl: null
  })
  const navigate = useNavigate()
  const user = useSelector((state) => state.user?.userInfo)

  useEffect(() => {
    fetchTestResults()
    loadReviewedServices()
  }, [])

  // Load danh sách services đã đánh giá từ localStorage
  const loadReviewedServices = () => {
    const saved = localStorage.getItem(`reviewed_services_${user?.accountId}`)
    if (saved) {
      setReviewedServices(new Set(JSON.parse(saved)))
    }
  }

  // Lưu service đã đánh giá vào localStorage
  const saveReviewedService = (serviceId) => {
    const updated = new Set([...reviewedServices, serviceId])
    setReviewedServices(updated)
    localStorage.setItem(`reviewed_services_${user?.accountId}`, JSON.stringify([...updated]))
  }

  const fetchTestResults = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/api/booking-details/paid/account/${user.accountId}`)

      // Lọc chỉ những booking có status liên quan đến xét nghiệm
      const testResults = response.data.filter(
        (item) => item.status === 'Đã có kết quả' || item.status === 'Đã xét nghiệm'
      )

      setTestResults(testResults || [])
    } catch (error) {
      console.error('Error fetching test results:', error)

      if (error.response?.status === 404) {
        setError('Không tìm thấy kết quả xét nghiệm')
        setTestResults([])
      } else if (error.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn')
      } else {
        setError('Không thể tải kết quả xét nghiệm. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleViewResult = (result) => {
    if (result.resultFileUrl) {
      // Tạo unique key cho service này (có thể dùng serviceId hoặc bookingDetailId)
      const serviceKey = result.serviceId || result.bookingDetailId

      // Kiểm tra đã đánh giá chưa
      if (reviewedServices.has(serviceKey)) {
        // Đã đánh giá rồi → Mở kết quả trực tiếp
        window.open(result.resultFileUrl, '_blank')
      } else {
        // Chưa đánh giá → Hiện modal feedback
        setFeedbackModal({
          open: true,
          serviceId: serviceKey,
          serviceName: result.serviceName,
          content: '',
          rating: 5,
          loading: false,
          resultUrl: result.resultFileUrl
        })
      }
    } else {
      alert('Chưa có kết quả để xem')
    }
  }

  const handleSendFeedback = async () => {
    if (!feedbackModal.serviceId || !user?.accountId) return

    setFeedbackModal((prev) => ({ ...prev, loading: true }))

    try {
      await api.post('/api/Feedback', {
        serviceId: feedbackModal.serviceId,
        accountId: user.accountId,
        detail: feedbackModal.content,
        rating: feedbackModal.rating
      })

      // Lưu service đã đánh giá
      saveReviewedService(feedbackModal.serviceId)

      alert('Gửi đánh giá thành công! Cảm ơn bạn đã góp ý.')

      // Mở kết quả sau khi gửi feedback thành công
      if (feedbackModal.resultUrl) {
        window.open(feedbackModal.resultUrl, '_blank')
      }

      setFeedbackModal({
        open: false,
        serviceId: null,
        serviceName: '',
        content: '',
        rating: 5,
        loading: false,
        resultUrl: null
      })
    } catch (error) {
      console.error('Error sending feedback:', error)
      alert('Gửi đánh giá thất bại! Vui lòng thử lại.')
      setFeedbackModal((prev) => ({ ...prev, loading: false }))
    }
  }

  const handleSkipFeedback = () => {
    // Lưu service đã "bỏ qua đánh giá" để không hỏi lại
    saveReviewedService(feedbackModal.serviceId)

    // Mở kết quả khi bỏ qua feedback
    if (feedbackModal.resultUrl) {
      window.open(feedbackModal.resultUrl, '_blank')
    }

    setFeedbackModal({
      open: false,
      serviceId: null,
      serviceName: '',
      content: '',
      rating: 5,
      loading: false,
      resultUrl: null
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đã có kết quả':
        return <Badge className='bg-green-100 text-green-800'>Có kết quả</Badge>
      case 'Đã xét nghiệm':
        return <Badge className='bg-yellow-100 text-yellow-800'>Chờ kết quả</Badge>
      default:
        return <Badge className='bg-gray-100 text-gray-800'>{status}</Badge>
    }
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

  // Kiểm tra service đã được đánh giá chưa
  const isServiceReviewed = (result) => {
    const serviceKey = result.serviceId || result.bookingDetailId
    return reviewedServices.has(serviceKey)
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
              <h1 className='text-2xl font-bold text-gray-900'>Kết quả xét nghiệm</h1>
              <p className='text-gray-600'>Xem kết quả và tiến trình xét nghiệm</p>
            </div>
          </div>

          <Button
            onClick={fetchTestResults}
            variant='outline'
            size='sm'
            disabled={loading}
            className='border-primary-500 text-primary-500 hover:bg-primary-50'
          >
            {loading ? <Loader className='animate-spin h-4 w-4' /> : 'Làm mới'}
          </Button>
        </div>

        {/* Results List */}
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
                <Button onClick={fetchTestResults} variant='outline'>
                  Thử lại
                </Button>
              </div>
            </Card>
          ) : testResults.length === 0 ? (
            <Card className='p-8'>
              <div className='text-center text-gray-500'>
                <FileText className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                <p className='mb-4'>Chưa có kết quả xét nghiệm nào</p>
                <Button
                  onClick={() => navigate('/test-service')}
                  className='bg-gradient-primary hover:opacity-90 text-white'
                >
                  Đặt xét nghiệm ngay
                </Button>
              </div>
            </Card>
          ) : (
            testResults.map((result) => (
              <Card key={result.bookingDetailId} className='border shadow-sm hover:shadow-md transition-shadow'>
                <CardContent className='p-6'>
                  {/* Header */}
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <FileText className='h-5 w-5 text-primary-500' />
                      <div>
                        <h3 className='font-semibold text-lg text-gray-900'>{result.serviceName}</h3>
                        <p className='text-xs text-gray-500'>#{truncateId(result.bookingDetailId, 8)}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {getStatusBadge(result.status)}
                      {/* Hiển thị badge đã đánh giá */}
                      {isServiceReviewed(result) && (
                        <Badge className='bg-blue-100 text-blue-800'>
                          <Star className='h-3 w-3 mr-1' />
                          Đã đánh giá
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Test Info */}
                  <div className='grid md:grid-cols-2 gap-4 mb-4'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-primary-500' />
                      <div>
                        <p className='text-sm text-gray-500'>Ngày xét nghiệm</p>
                        <p className='font-semibold'>{new Date(result.slotDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-primary-500' />
                      <div>
                        <p className='text-sm text-gray-500'>Ca xét nghiệm</p>
                        <p className='font-semibold'>{getShiftTime(result.slotShift)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className='p-3 bg-gray-50 rounded-lg mb-4'>
                    <div className='flex items-center gap-2 mb-3'>
                      <User className='h-4 w-4 text-primary-500' />
                      <span className='font-medium text-gray-700'>Thông tin bệnh nhân</span>
                    </div>
                    <div className='grid md:grid-cols-2 gap-3 text-sm'>
                      <div>
                        <span className='text-gray-500'>Tên:</span>
                        <span className='ml-2 font-medium'>
                          {result.firstName} {result.lastName}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-500'>SĐT:</span>
                        <span className='ml-2 font-medium'>{result.phone}</span>
                      </div>
                      <div>
                        <span className='text-gray-500'>Ngày sinh:</span>
                        <span className='ml-2 font-medium'>
                          {new Date(result.dateOfBirth).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-500'>Giới tính:</span>
                        <span className='ml-2 font-medium'>{result.gender ? 'Nam' : 'Nữ'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Result Status */}
                  {result.resultFileUrl ? (
                    <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-green-100 rounded-full'>
                            <FileText className='h-5 w-5 text-green-600' />
                          </div>
                          <div>
                            <p className='font-semibold text-green-800'>Kết quả đã sẵn sàng</p>
                            <p className='text-sm text-green-600'>
                              {isServiceReviewed(result) ? 'Nhấn để xem kết quả' : 'Nhấn để xem kết quả và đánh giá'}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleViewResult(result)}
                          className='bg-green-600 hover:bg-green-700 text-white'
                        >
                          <Eye className='h-4 w-4 mr-2' />
                          Xem kết quả
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-yellow-100 rounded-full'>
                          <Clock className='h-5 w-5 text-yellow-600' />
                        </div>
                        <div>
                          <p className='font-semibold text-yellow-800'>Đang chờ kết quả</p>
                          <p className='text-sm text-yellow-600'>Kết quả sẽ có trong 1-2 ngày làm việc</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackModal.open && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-2 bg-primary-100 rounded-full'>
                <MessageSquare className='h-5 w-5 text-primary-600' />
              </div>
              <div>
                <h3 className='font-semibold text-lg'>Đánh giá dịch vụ</h3>
                <p className='text-sm text-gray-600'>{feedbackModal.serviceName}</p>
              </div>
            </div>

            <div className='mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200'>
              <p className='text-sm text-blue-700'>
                💡 Vui lòng đánh giá trải nghiệm của bạn trước khi xem kết quả chi tiết
              </p>
            </div>

            {/* Rating */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Đánh giá sao</label>
              <div className='flex items-center gap-1'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type='button'
                    className='text-2xl focus:outline-none hover:scale-110 transition-transform'
                    onClick={() => setFeedbackModal((prev) => ({ ...prev, rating: star }))}
                    disabled={feedbackModal.loading}
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= feedbackModal.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
                <span className='ml-2 text-sm text-gray-600'>({feedbackModal.rating}/5 sao)</span>
              </div>
            </div>

            {/* Comment */}
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Nhận xét của bạn (tùy chọn)</label>
              <textarea
                className='w-full border border-gray-300 rounded-lg p-3 min-h-[80px] focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none'
                placeholder='Chia sẻ trải nghiệm của bạn về dịch vụ này...'
                value={feedbackModal.content}
                onChange={(e) => setFeedbackModal((prev) => ({ ...prev, content: e.target.value }))}
                disabled={feedbackModal.loading}
              />
            </div>

            {/* Actions */}
            <div className='flex gap-3'>
              <Button
                onClick={handleSkipFeedback}
                variant='outline'
                className='flex-1'
                disabled={feedbackModal.loading}
              >
                Bỏ qua & Xem kết quả
              </Button>
              <Button
                onClick={handleSendFeedback}
                className='flex-1 bg-gradient-primary hover:opacity-90 text-white'
                disabled={feedbackModal.loading}
              >
                {feedbackModal.loading ? (
                  <>
                    <Loader className='animate-spin h-4 w-4 mr-2' />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi & Xem kết quả'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestResultsHistory
