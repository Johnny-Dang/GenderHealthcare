import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  User,
  Calendar,
  Tag,
  Clock,
  Phone,
  CreditCard,
  CheckCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  Download,
  Loader,
  ExternalLink
} from 'lucide-react'
import api from '@/configs/axios'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const BookingDetailPage = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [resultModal, setResultModal] = useState({ open: false, loading: false, data: null, error: null })
  const user = useSelector((state) => state.user.userInfo)
  const [feedbackModal, setFeedbackModal] = useState({
    open: false,
    detail: null,
    content: '',
    rating: 5,
    loading: false
  })

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/api/booking-details/booking/${bookingId}`)
        setDetails(res.data)
      } catch (err) {
        setError('Lỗi khi tải chi tiết dịch vụ.')
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [bookingId])

  const handleShowResult = async (bookingDetailId) => {
    setResultModal({ open: true, loading: true, data: null, error: null })
    try {
      const res = await api.get(`api/TestResult/booking-detail/${bookingDetailId}`)
      setResultModal({ open: true, loading: false, data: res.data?.[0] || null, error: null })
    } catch (err) {
      setResultModal({ open: true, loading: false, data: null, error: 'Không thể tải kết quả.' })
    }
  }

  const handleSendFeedback = async () => {
    if (!feedbackModal.detail || !user?.accountId) return
    setFeedbackModal((s) => ({ ...s, loading: true }))
    try {
      await api.post('api/Feedback', {
        serviceId: feedbackModal.detail.serviceId,
        accountId: user.accountId,
        detail: feedbackModal.content,
        rating: feedbackModal.rating
      })
      toast.success('Gửi feedback thành công!')
      setFeedbackModal({ open: false, detail: null, content: '', rating: 5, loading: false })
    } catch (err) {
      toast.error('Gửi feedback thất bại!')
      setFeedbackModal((s) => ({ ...s, loading: false }))
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'hoàn thành': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className='h-3.5 w-3.5 mr-1' />
      },
      'đang xử lý': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Clock className='h-3.5 w-3.5 mr-1' />
      },
      'chờ xác nhận': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className='h-3.5 w-3.5 mr-1' />
      },
      'đã hủy': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertCircle className='h-3.5 w-3.5 mr-1' />
      }
    }

    const config = statusConfig[status?.toLowerCase()] || {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <Clock className='h-3.5 w-3.5 mr-1' />
    }

    return (
      <Badge variant='outline' className={`flex items-center px-2 py-0.5 ${config.color}`}>
        {config.icon} {status}
      </Badge>
    )
  }

  return (
    <div className='min-h-screen bg-slate-50 flex flex-col'>
      <Navigation />
      <div className='flex-1 w-full'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <Button variant='outline' onClick={() => navigate(-1)} className='mb-4 flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4 mr-1' /> Quay lại
          </Button>

          <Card className='border shadow-md mb-6'>
            <CardHeader className='bg-slate-100'>
              <CardTitle className='text-xl'>Chi tiết dịch vụ trong đơn đặt lịch</CardTitle>
              <CardDescription>
                Mã đơn: <span className='font-semibold'>{bookingId}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className='p-6'>
              {loading ? (
                <div className='flex items-center justify-center text-gray-500 py-8'>
                  <Loader className='h-6 w-6 animate-spin mr-2' />
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : error ? (
                <div className='text-center text-red-500 py-6'>
                  <AlertCircle className='h-8 w-8 mx-auto mb-2' />
                  <p>{error}</p>
                </div>
              ) : details.length === 0 ? (
                <div className='text-center text-gray-500 py-6'>
                  <FileText className='h-8 w-8 mx-auto mb-2 text-gray-300' />
                  <p>Không có dịch vụ nào trong đơn này.</p>
                </div>
              ) : (
                <div className='grid md:grid-cols-1 lg:grid-cols-2 gap-6'>
                  {details.map((detail) => (
                    <Card key={detail.bookingDetailId} className='border shadow-sm'>
                      <CardHeader className='pb-2 border-b'>
                        <div className='flex items-center justify-between'>
                          <CardTitle className='text-lg flex items-center'>
                            <Tag className='h-4 w-4 mr-2 text-blue-500' />
                            {detail.serviceName}
                          </CardTitle>
                          {getStatusBadge(detail.status)}
                        </div>
                      </CardHeader>

                      <CardContent className='p-4'>
                        <div className='grid grid-cols-2 gap-3'>
                          <div className='flex items-start gap-2 text-gray-700'>
                            <User className='h-4 w-4 text-gray-400 mt-1' />
                            <div>
                              <span className='text-xs text-gray-500 block'>Khách hàng</span>
                              <span>
                                {detail.lastName} {detail.firstName}
                              </span>
                            </div>
                          </div>

                          <div className='flex items-start gap-2 text-gray-700'>
                            <Calendar className='h-4 w-4 text-gray-400 mt-1' />
                            <div>
                              <span className='text-xs text-gray-500 block'>Ngày sinh</span>
                              <span>{detail.dateOfBirth}</span>
                            </div>
                          </div>

                          <div className='flex items-start gap-2 text-gray-700'>
                            <User className='h-4 w-4 text-gray-400 mt-1' />
                            <div>
                              <span className='text-xs text-gray-500 block'>Giới tính</span>
                              <span>{detail.gender === true ? 'Nam' : 'Nữ'}</span>
                            </div>
                          </div>

                          <div className='flex items-start gap-2 text-gray-700'>
                            <Phone className='h-4 w-4 text-gray-400 mt-1' />
                            <div>
                              <span className='text-xs text-gray-500 block'>Số điện thoại</span>
                              <span>{detail.phone}</span>
                            </div>
                          </div>

                          <div className='flex items-start gap-2 text-gray-700 col-span-2'>
                            <CreditCard className='h-4 w-4 text-gray-400 mt-1' />
                            <div>
                              <span className='text-xs text-gray-500 block'>Giá dịch vụ</span>
                              <span className='font-bold text-blue-600'>{detail.price?.toLocaleString()} VND</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className='bg-slate-50 p-3 flex gap-3 justify-end border-t'>
                        <Button
                          size='sm'
                          className='bg-blue-600 hover:bg-blue-700'
                          onClick={() => handleShowResult(detail.bookingDetailId)}
                        >
                          <FileText className='h-4 w-4 mr-1' />
                          Xem Kết Quả
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            setFeedbackModal({ open: true, detail, content: '', rating: 5, loading: false })
                          }
                        >
                          <MessageSquare className='h-4 w-4 mr-1' />
                          Đánh Giá
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />

      {/* Result Modal */}
      <Dialog open={resultModal.open} onOpenChange={(open) => setResultModal((s) => ({ ...s, open }))}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Kết quả xét nghiệm
            </DialogTitle>
          </DialogHeader>

          {resultModal.loading ? (
            <div className='flex items-center justify-center py-6'>
              <Loader className='animate-spin mr-2 h-5 w-5 text-blue-500' />
              <span>Đang tải kết quả...</span>
            </div>
          ) : resultModal.error ? (
            <div className='text-red-500 text-center py-6'>
              <AlertCircle className='h-8 w-8 mx-auto mb-2' />
              <p>{resultModal.error}</p>
            </div>
          ) : resultModal.data ? (
            <div className='space-y-4'>
              <div className='grid grid-cols-1 gap-3'>
                <div className='p-3 bg-slate-50 rounded-lg'>
                  <p className='text-sm text-gray-500'>Khách hàng</p>
                  <p className='font-medium'>{resultModal.data.customerName}</p>
                </div>

                <div className='p-3 bg-slate-50 rounded-lg'>
                  <p className='text-sm text-gray-500'>Dịch vụ</p>
                  <p className='font-medium'>{resultModal.data.serviceName}</p>
                </div>

                <div className='p-3 bg-blue-50 rounded-lg border border-blue-100'>
                  <p className='text-sm text-blue-500'>Trạng thái</p>
                  <p className='font-medium flex items-center gap-2'>
                    {resultModal.data.status === 'Đã có kết quả' ? (
                      <CheckCircle className='h-4 w-4 text-green-500' />
                    ) : (
                      <Clock className='h-4 w-4 text-amber-500' />
                    )}
                    {resultModal.data.status}
                  </p>
                </div>

                {resultModal.data.result && resultModal.data.status === 'Đã có kết quả' && (
                  <div className='p-4 border border-blue-100 bg-blue-50 rounded-lg'>
                    <p className='text-sm text-blue-700 mb-2'>Kết quả xét nghiệm đã sẵn sàng</p>
                    <div className='flex gap-2'>
                      <Button
                        className='bg-blue-600 hover:bg-blue-700 flex-1'
                        onClick={() => window.open(resultModal.data.result, '_blank')}
                      >
                        <ExternalLink className='h-4 w-4 mr-1' /> Xem kết quả
                      </Button>
                      <Button
                        variant='outline'
                        className='border-blue-200 hover:bg-blue-100 text-blue-600'
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = resultModal.data.result
                          link.download = `Kết quả xét nghiệm - ${resultModal.data.serviceName}.pdf`
                          link.click()
                        }}
                      >
                        <Download className='h-4 w-4 mr-1' /> Tải xuống
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className='text-right text-sm text-gray-500 pt-2'>
                Ngày tạo: {new Date(resultModal.data.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ) : (
            <div className='text-gray-500 text-center py-6'>
              <FileText className='h-8 w-8 mx-auto mb-2 text-gray-300' />
              <p>Không có dữ liệu kết quả.</p>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setResultModal((s) => ({ ...s, open: false }))}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      <Dialog open={feedbackModal.open} onOpenChange={(open) => setFeedbackModal((s) => ({ ...s, open }))}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <MessageSquare className='h-5 w-5' />
              Đánh giá dịch vụ
            </DialogTitle>
            {feedbackModal.detail && (
              <DialogDescription className='mt-1'>
                Dịch vụ: <span className='font-medium'>{feedbackModal.detail.serviceName}</span>
              </DialogDescription>
            )}
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Nội dung đánh giá</label>
              <textarea
                className='w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Chia sẻ trải nghiệm của bạn về dịch vụ này...'
                value={feedbackModal.content}
                onChange={(e) => setFeedbackModal((s) => ({ ...s, content: e.target.value }))}
                disabled={feedbackModal.loading}
              />
            </div>

            <div className='bg-slate-50 p-3 rounded-lg'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Đánh giá sao</label>
              <div className='flex items-center gap-1'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type='button'
                    className='text-2xl focus:outline-none'
                    onClick={() => setFeedbackModal((s) => ({ ...s, rating: star }))}
                    disabled={feedbackModal.loading}
                  >
                    <span className={`${feedbackModal.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                  </button>
                ))}
                <span className='ml-2 text-sm font-medium text-gray-700'>{feedbackModal.rating}/5</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className='flex justify-end gap-3 w-full'>
              <Button
                variant='outline'
                onClick={() => setFeedbackModal({ open: false, detail: null, content: '', rating: 5, loading: false })}
                disabled={feedbackModal.loading}
              >
                Huỷ
              </Button>
              <Button
                className='bg-blue-600'
                disabled={!feedbackModal.content.trim() || feedbackModal.loading}
                onClick={handleSendFeedback}
              >
                {feedbackModal.loading ? (
                  <>
                    <Loader className='h-4 w-4 mr-2 animate-spin' />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi đánh giá'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default BookingDetailPage
