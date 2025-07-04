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
  MessageSquare
} from 'lucide-react'
import clsx from 'clsx'
import api from '@/configs/axios'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Loader } from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

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

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
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
      'đã hủy': { color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertCircle className='h-3.5 w-3.5 mr-1' /> }
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
    <div className='min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex flex-col'>
      <Navigation />
      <div className='flex-1 w-full'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <Button
              variant='outline'
              onClick={() => navigate(-1)}
              className='mb-6 flex items-center gap-2 hover:bg-pink-50 hover:text-pink-600 transition-colors'
            >
              <ArrowLeft className='h-4 w-4 mr-1' /> Quay lại
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className='border-0 shadow-xl overflow-hidden mb-8'>
              <CardHeader className='bg-gradient-to-r from-pink-500 to-cyan-500 text-white'>
                <CardTitle className='text-2xl mb-1'>Chi tiết dịch vụ trong đơn đặt lịch</CardTitle>
                <CardDescription className='text-white/90'>
                  Mã đơn: <span className='font-semibold text-white'>{bookingId}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className='p-8 bg-white'>
                {loading ? (
                  <div className='flex flex-col items-center justify-center text-gray-500 py-12'>
                    <Loader className='h-10 w-10 text-pink-500 animate-spin mb-4' />
                    <p className='text-lg'>Đang tải dữ liệu...</p>
                  </div>
                ) : error ? (
                  <div className='text-center text-red-500 py-12 flex flex-col items-center'>
                    <AlertCircle className='h-12 w-12 mb-4' />
                    <p className='text-lg'>{error}</p>
                  </div>
                ) : details.length === 0 ? (
                  <div className='text-center text-gray-500 py-12 flex flex-col items-center'>
                    <FileText className='h-12 w-12 text-gray-300 mb-4' />
                    <p className='text-lg'>Không có dịch vụ nào trong đơn này.</p>
                  </div>
                ) : (
                  <motion.div
                    className='grid md:grid-cols-2 gap-8'
                    variants={containerVariants}
                    initial='hidden'
                    animate='visible'
                  >
                    {details.map((detail, idx) => (
                      <motion.div key={detail.bookingDetailId} variants={itemVariants}>
                        <Card className='border shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden'>
                          <div className='h-2 w-full bg-gradient-to-r from-pink-500 to-cyan-500'></div>
                          <CardHeader className='pb-2'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-3'>
                                <div className='p-2 rounded-full bg-pink-100'>
                                  <Tag className='h-5 w-5 text-pink-500' />
                                </div>
                                <CardTitle className='text-lg font-bold text-gray-800'>{detail.serviceName}</CardTitle>
                              </div>
                              {getStatusBadge(detail.status)}
                            </div>
                          </CardHeader>

                          <CardContent className='p-6 pt-2'>
                            <div className='grid grid-cols-2 gap-4'>
                              <div className='mb-2 flex items-center gap-2 text-gray-700'>
                                <User className='h-4 w-4 text-pink-400 flex-shrink-0' />
                                <div>
                                  <span className='text-xs text-gray-500 block'>Khách hàng</span>
                                  <span className='font-medium'>
                                    {detail.lastName} {detail.firstName}
                                  </span>
                                </div>
                              </div>

                              <div className='mb-2 flex items-center gap-2 text-gray-700'>
                                <Calendar className='h-4 w-4 text-cyan-400 flex-shrink-0' />
                                <div>
                                  <span className='text-xs text-gray-500 block'>Ngày sinh</span>
                                  <span className='font-medium'>{detail.dateOfBirth}</span>
                                </div>
                              </div>

                              <div className='mb-2 flex items-center gap-2 text-gray-700'>
                                <User className='h-4 w-4 text-blue-400 flex-shrink-0' />
                                <div>
                                  <span className='text-xs text-gray-500 block'>Giới tính</span>
                                  <span className='font-medium'>{detail.gender === true ? 'Nam' : 'Nữ'}</span>
                                </div>
                              </div>

                              <div className='mb-2 flex items-center gap-2 text-gray-700'>
                                <Phone className='h-4 w-4 text-green-400 flex-shrink-0' />
                                <div>
                                  <span className='text-xs text-gray-500 block'>Số điện thoại</span>
                                  <span className='font-medium'>{detail.phone}</span>
                                </div>
                              </div>

                              <div className='mb-2 flex items-center gap-2 text-gray-700 col-span-2'>
                                <CreditCard className='h-4 w-4 text-purple-400 flex-shrink-0' />
                                <div>
                                  <span className='text-xs text-gray-500 block'>Giá dịch vụ</span>
                                  <span className='font-bold text-pink-600'>{detail.price?.toLocaleString()} VND</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>

                          <CardFooter className='bg-gray-50 p-4 flex gap-3 justify-end'>
                            <Button
                              size='sm'
                              className='bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg transition-shadow'
                              onClick={() => handleShowResult(detail.bookingDetailId)}
                            >
                              <FileText className='h-4 w-4 mr-1' />
                              Xem Kết Quả
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              className='border-pink-200 hover:bg-pink-50 hover:text-pink-600 transition-colors'
                              onClick={() =>
                                setFeedbackModal({ open: true, detail, content: '', rating: 5, loading: false })
                              }
                            >
                              <MessageSquare className='h-4 w-4 mr-1' />
                              Gửi Đánh Giá
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
      {/* Result Modal */}
      <Dialog open={resultModal.open} onOpenChange={(open) => setResultModal((s) => ({ ...s, open }))}>
        <DialogContent className='max-w-lg border-0 shadow-xl'>
          <DialogHeader className='bg-gradient-to-r from-cyan-500 to-blue-500 p-4 text-white rounded-t-lg'>
            <DialogTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Kết quả xét nghiệm
            </DialogTitle>
          </DialogHeader>

          {resultModal.loading ? (
            <div className='flex flex-col items-center py-12'>
              <Loader className='animate-spin mb-4 h-10 w-10 text-cyan-500' />
              <span className='text-lg'>Đang tải kết quả...</span>
            </div>
          ) : resultModal.error ? (
            <div className='text-red-500 text-center py-12 flex flex-col items-center'>
              <AlertCircle className='h-12 w-12 mb-4' />
              <p className='text-lg'>{resultModal.error}</p>
            </div>
          ) : resultModal.data ? (
            <div className='p-6 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='p-3 bg-gray-50 rounded-lg'>
                  <p className='text-sm text-gray-500'>Khách hàng</p>
                  <p className='font-medium text-gray-800'>{resultModal.data.customerName}</p>
                </div>

                <div className='p-3 bg-gray-50 rounded-lg'>
                  <p className='text-sm text-gray-500'>Dịch vụ</p>
                  <p className='font-medium text-gray-800'>{resultModal.data.serviceName}</p>
                </div>
              </div>

              <div className='p-4 bg-blue-50 border border-blue-100 rounded-lg'>
                <p className='text-sm text-blue-500 mb-1'>Kết quả xét nghiệm</p>
                <p className='text-lg font-bold text-blue-700'>{resultModal.data.result}</p>
              </div>

              <div className='flex items-center gap-2'>
                <Badge
                  className={resultModal.data.status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                >
                  {resultModal.data.status ? 'Đã trả kết quả' : 'Chưa có kết quả'}
                </Badge>
              </div>

              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-gray-500'>Ngày tạo</p>
                  <p className='font-medium'>
                    {resultModal.data.createdAt ? new Date(resultModal.data.createdAt).toLocaleString('vi-VN') : ''}
                  </p>
                </div>

                {resultModal.data.updatedAt && (
                  <div>
                    <p className='text-gray-500'>Cập nhật lần cuối</p>
                    <p className='font-medium'>{new Date(resultModal.data.updatedAt).toLocaleString('vi-VN')}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='text-gray-500 text-center py-12 flex flex-col items-center'>
              <FileText className='h-12 w-12 text-gray-300 mb-4' />
              <p className='text-lg'>Không có dữ liệu kết quả.</p>
            </div>
          )}

          <DialogFooter className='bg-gray-50 p-4 rounded-b-lg'>
            <Button
              onClick={() => setResultModal((s) => ({ ...s, open: false }))}
              className='bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg transition-shadow'
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      <Dialog open={feedbackModal.open} onOpenChange={(open) => setFeedbackModal((s) => ({ ...s, open }))}>
        <DialogContent className='max-w-lg border-0 shadow-xl'>
          <DialogHeader className='bg-gradient-to-r from-pink-500 to-purple-500 p-4 text-white rounded-t-lg'>
            <DialogTitle className='flex items-center gap-2'>
              <MessageSquare className='h-5 w-5' />
              Đánh giá dịch vụ
            </DialogTitle>
            {feedbackModal.detail && (
              <DialogDescription className='text-white/90 mt-1'>
                Dịch vụ: <span className='font-semibold text-white'>{feedbackModal.detail.serviceName}</span>
              </DialogDescription>
            )}
          </DialogHeader>

          <div className='p-6'>
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Nội dung đánh giá</label>
              <textarea
                className='w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all'
                placeholder='Chia sẻ trải nghiệm của bạn về dịch vụ này...'
                value={feedbackModal.content}
                onChange={(e) => setFeedbackModal((s) => ({ ...s, content: e.target.value }))}
                disabled={feedbackModal.loading}
              />
            </div>

            <div className='bg-pink-50 p-4 rounded-lg'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Đánh giá sao</label>
              <div className='flex items-center gap-2'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type='button'
                    className={`text-2xl focus:outline-none`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFeedbackModal((s) => ({ ...s, rating: star }))}
                    disabled={feedbackModal.loading}
                  >
                    <span className={`${feedbackModal.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                  </motion.button>
                ))}
                <span className='ml-2 text-sm font-medium text-gray-700'>{feedbackModal.rating}/5</span>
              </div>
            </div>
          </div>

          <DialogFooter className='bg-gray-50 p-4 rounded-b-lg'>
            <div className='flex justify-end gap-3 w-full'>
              <Button
                variant='outline'
                onClick={() => setFeedbackModal({ open: false, detail: null, content: '', rating: 5, loading: false })}
                disabled={feedbackModal.loading}
                className='border-gray-300'
              >
                Huỷ
              </Button>
              <Button
                className='bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg transition-shadow'
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
