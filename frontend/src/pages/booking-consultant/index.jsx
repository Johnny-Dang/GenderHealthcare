import React, { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, MessageSquare, Star, Clock, GraduationCap, AlertCircle } from 'lucide-react'

import api from '@/configs/axios'
import { Spin } from 'antd'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'

const BookingConsultant = () => {
  const [loading, setLoading] = useState(true)
  const [consultants, setConsultants] = useState([])
  const userInfo = useSelector((state) => state.user.userInfo)
  const [selectedConsultant, setSelectedConsultant] = useState(null)

  // Cấu trúc lại formData để phù hợp với API endpoint
  const [formData, setFormData] = useState({
    // Thông tin của người đăng nhập hoặc khách
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    // Thông tin đặt lịch
    staffId: '',
    scheduledDate: '',
    scheduledTime: '',
    message: ''
  })

  // Cập nhật formData khi component mount và khi userInfo thay đổi
  useEffect(() => {
    if (userInfo) {
      // Nếu là người dùng đã đăng nhập, chỉ cần chuẩn bị dữ liệu gửi lên
      // Không cần hiển thị trường nhập thông tin cá nhân
      setFormData((prevData) => ({
        ...prevData,
        // Vẫn lưu thông tin để hiển thị trong form (optional)
        guestName: userInfo.fullName || '',
        guestEmail: userInfo.email || '',
        guestPhone: userInfo.phone || ''
      }))
    } else {
      // Nếu là khách, reset form để người dùng nhập thông tin
      setFormData((prevData) => ({
        ...prevData,
        guestName: '',
        guestEmail: '',
        guestPhone: ''
      }))
    }
  }, [userInfo])

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setLoading(true)
        const response = await api.get('/api/consultants')
        console.log('Consultants data:', response.data) // Debug log
        setConsultants(response.data)
      } catch (error) {
        console.error('Error fetching consultants:', error)
        toast.error('Không thể tải danh sách tư vấn viên')
      } finally {
        setLoading(false)
      }
    }

    fetchConsultants()
  }, [])

  // Cập nhật hàm handleBookingSubmit để xử lý theo API mới
  const handleBookingSubmit = async (e) => {
    e.preventDefault()

    // Kiểm tra dữ liệu bắt buộc
    if (!selectedConsultant) {
      toast.error('Vui lòng chọn tư vấn viên!')
      return
    }

    if (!userInfo && (!formData.guestName || !formData.guestEmail || !formData.guestPhone)) {
      toast.error('Vui lòng điền đầy đủ thông tin cá nhân!')
      return
    }

    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Vui lòng chọn ngày và giờ tư vấn!')
      return
    }

    // Tạo đối tượng thời gian từ ngày và giờ
    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`)

    try {
      // Tạo payload theo định dạng API yêu cầu
      const payload = {
        // Nếu đã đăng nhập thì dùng customerId, nếu không thì dùng thông tin guest
        customerId: userInfo ? userInfo.id : null,
        guestName: !userInfo ? formData.guestName : null,
        guestEmail: !userInfo ? formData.guestEmail : null,
        guestPhone: !userInfo ? formData.guestPhone : null,
        staffId: selectedConsultant.id,
        scheduledAt: scheduledDateTime.toISOString(), // Format theo ISO string: YYYY-MM-DDTHH:mm:ss.sssZ
        message: formData.message
      }

      console.log('Sending booking data:', payload)

      // Gọi API đặt lịch
      await api.post('/api/ConsultationBooking/book', payload)

      toast.success('Đặt lịch thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.')

      // Reset form sau khi đặt lịch thành công
      setFormData({
        guestName: userInfo?.fullName || '',
        guestEmail: userInfo?.email || '',
        guestPhone: userInfo?.phone || '',
        staffId: '',
        scheduledDate: '',
        scheduledTime: '',
        message: ''
      })
      setSelectedConsultant(null)
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Đã xảy ra lỗi khi đặt lịch. Vui lòng thử lại sau.')
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const getInitialAvatar = (name) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className='min-h-screen'>
      <Navigation />

      {/* Hero Section */}
      <section className='bg-gradient-to-r from-blue-50 to-indigo-50 py-16'>
        <div className='max-w-4xl mx-auto px-4 text-center'>
          <h1 className='text-4xl font-bold text-gray-900 mb-6'>
            Đặt lịch <span className='text-blue-600'>tư vấn trực tuyến</span>
          </h1>
          <p className='text-lg text-gray-600 mb-8'>
            Kết nối với các chuyên gia y tế hàng đầu để được tư vấn về sức khỏe sinh sản
          </p>
          {!userInfo && (
            <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto'>
              <div className='flex items-center gap-2 text-amber-800'>
                <AlertCircle className='w-5 h-5' />
                <span className='text-sm font-medium'>Không cần đăng nhập để đặt tư vấn</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Consultants Section */}
      <section className='py-16 bg-gradient-to-b from-gray-50 to-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              Đội ngũ{' '}
              <span className='bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600'>
                chuyên gia tư vấn
              </span>
            </h2>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              Các chuyên gia có chuyên môn cao và kinh nghiệm lâu năm, sẵn sàng hỗ trợ bạn mọi lúc
            </p>
          </div>

          {loading ? (
            <div className='flex justify-center items-center py-16'>
              <Spin spinning={true} tip='Đang tải danh sách tư vấn viên...'>
                <div className='min-h-[200px] flex items-center justify-center'>
                  {/* This empty div provides space for the spinner to display properly */}
                </div>
              </Spin>
            </div>
          ) : consultants.length === 0 ? (
            <div className='text-center py-16'>
              <p className='text-gray-500 text-lg'>Chưa có tư vấn viên nào trong hệ thống</p>
            </div>
          ) : (
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {consultants.map((consultant) => (
                <Card
                  key={consultant.id}
                  className='group border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden rounded-xl'
                >
                  <CardContent className='p-0'>
                    {/* Phần ảnh đại diện - được thiết kế đẹp hơn */}
                    <div className='relative h-60 overflow-hidden'>
                      {consultant.avatarUrl ? (
                        <img
                          src={consultant.avatarUrl}
                          alt={consultant.fullName}
                          className='w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500'
                          loading='lazy'
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.style.display = 'none'

                            const div = document.createElement('div')
                            div.className =
                              'w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-violet-500'
                            div.innerHTML = `
                              <div class="text-6xl font-bold text-white mb-2">${getInitialAvatar(consultant.fullName)}</div>
                              <div class="text-white/80 text-sm font-medium">${consultant.department || 'Chuyên gia'}</div>
                            `
                            e.target.parentNode.appendChild(div)
                          }}
                        />
                      ) : (
                        <div className='w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-violet-500'>
                          <div className='text-6xl font-bold text-white mb-2'>
                            {getInitialAvatar(consultant.fullName)}
                          </div>
                          <div className='text-white/80 text-sm font-medium'>
                            {consultant.department || 'Chuyên gia'}
                          </div>
                        </div>
                      )}

                      {/* Badge biểu thị số năm kinh nghiệm */}
                      {consultant.yearOfExperience > 0 && (
                        <div className='absolute top-4 right-4 bg-white/90 shadow-md text-blue-600 rounded-full py-1.5 px-3 flex items-center gap-1.5'>
                          <Clock className='w-4 h-4' />
                          <span className='font-semibold'>{consultant.yearOfExperience}+ năm</span>
                        </div>
                      )}

                      {/* Overlay gradient khi hover */}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                    </div>

                    {/* Phần thông tin - được thiết kế đẹp hơn */}
                    <div className='p-6 bg-white'>
                      <div className='flex justify-between items-start mb-4'>
                        <div>
                          <h3 className='text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors'>
                            {consultant.fullName}
                          </h3>

                          {consultant.department && (
                            <div className='flex items-center text-sm text-blue-600 font-medium mt-1'>
                              <span className='inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mr-2'></span>
                              {consultant.department}
                            </div>
                          )}
                        </div>

                        {/* Hiển thị chứng chỉ/học vấn nổi bật */}
                        {consultant.degree && (
                          <div className='bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded'>
                            {consultant.degree.split(' ').slice(-2).join(' ')}
                          </div>
                        )}
                      </div>

                      {/* Thông tin học vấn */}
                      {consultant.degree && (
                        <div className='flex items-center mb-3 text-sm'>
                          <GraduationCap className='w-4 h-4 text-gray-500 mr-2 flex-shrink-0' />
                          <span className='text-gray-700'>{consultant.degree}</span>
                        </div>
                      )}

                      {/* Biography với styling đẹp hơn */}
                      {consultant.biography && (
                        <div className='mb-5 relative'>
                          <div className='text-sm text-gray-600 italic line-clamp-2 bg-gray-50 p-3 rounded-lg border-l-2 border-blue-300'>
                            "{consultant.biography}"
                          </div>
                        </div>
                      )}

                      {/* Button đặt lịch */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className='w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow transition-all'
                            onClick={() => setSelectedConsultant(consultant)}
                          >
                            Đặt lịch tư vấn
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-md'>
                          <DialogHeader>
                            <DialogTitle>Đặt lịch với {consultant.fullName}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleBookingSubmit} className='space-y-4'>
                            {/* Hiện thông tin cá nhân chỉ khi chưa đăng nhập */}
                            {!userInfo ? (
                              <>
                                <div>
                                  <label className='block text-sm font-medium text-gray-700 mb-2'>Họ và tên</label>
                                  <input
                                    type='text'
                                    name='guestName'
                                    value={formData.guestName}
                                    onChange={handleFormChange}
                                    required
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                                  />
                                </div>
                                <div>
                                  <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                                  <input
                                    type='email'
                                    name='guestEmail'
                                    value={formData.guestEmail}
                                    onChange={handleFormChange}
                                    required
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                                  />
                                </div>
                                <div>
                                  <label className='block text-sm font-medium text-gray-700 mb-2'>Số điện thoại</label>
                                  <input
                                    type='tel'
                                    name='guestPhone'
                                    value={formData.guestPhone}
                                    onChange={handleFormChange}
                                    required
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                                  />
                                </div>
                              </>
                            ) : (
                              // Nếu người dùng đã đăng nhập, hiển thị thông tin họ dưới dạng readonly
                              <div className='bg-blue-50 p-3 rounded-lg'>
                                <p className='text-sm font-medium text-gray-700'>Đặt lịch với thông tin:</p>
                                <div className='flex items-center mt-2 gap-2'>
                                  <div className='h-8 w-8 flex items-center justify-center rounded-full overflow-hidden bg-blue-100'>
                                    {userInfo.avatarUrl ? (
                                      <img
                                        src={userInfo.avatarUrl}
                                        alt={userInfo.fullName}
                                        className='h-full w-full object-cover'
                                      />
                                    ) : (
                                      <span className='text-sm font-medium'>{getInitialAvatar(userInfo.fullName)}</span>
                                    )}
                                  </div>
                                  <div>
                                    <p className='text-sm font-medium'>{userInfo.fullName}</p>
                                    <p className='text-xs text-gray-500'>{userInfo.email}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Phần chọn ngày giờ - hiển thị cho tất cả */}
                            <div>
                              <label className='block text-sm font-medium text-gray-700 mb-2'>
                                <Calendar className='w-4 h-4 inline mr-1' />
                                Ngày mong muốn
                              </label>
                              <input
                                type='date'
                                name='scheduledDate'
                                value={formData.scheduledDate}
                                onChange={handleFormChange}
                                min={new Date().toISOString().split('T')[0]}
                                required
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                              />
                            </div>
                            <div>
                              <label className='block text-sm font-medium text-gray-700 mb-2'>
                                <Clock className='w-4 h-4 inline mr-1' />
                                Giờ mong muốn
                              </label>
                              <select
                                name='scheduledTime'
                                value={formData.scheduledTime}
                                onChange={handleFormChange}
                                required
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                              >
                                <option value=''>Chọn giờ</option>
                                <option value='08:00'>08:00</option>
                                <option value='09:00'>09:00</option>
                                <option value='10:00'>10:00</option>
                                <option value='14:00'>14:00</option>
                                <option value='15:00'>15:00</option>
                                <option value='16:00'>16:00</option>
                              </select>
                            </div>

                            {/* Phần ghi chú - hiển thị cho tất cả */}
                            <div>
                              <label className='block text-sm font-medium text-gray-700 mb-2'>
                                <MessageSquare className='w-4 h-4 inline mr-1' />
                                Ghi chú (tùy chọn)
                              </label>
                              <textarea
                                name='message'
                                value={formData.message}
                                onChange={handleFormChange}
                                rows={3}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                                placeholder='Mô tả vấn đề bạn cần tư vấn...'
                              ></textarea>
                            </div>

                            {/* Hidden input để lưu staffId */}
                            <input type='hidden' name='staffId' value={selectedConsultant?.id || ''} />

                            <Button
                              type='submit'
                              className='w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white'
                            >
                              Xác nhận đặt lịch
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default BookingConsultant
