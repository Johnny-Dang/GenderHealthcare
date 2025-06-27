import React, { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, MessageSquare, Star, Clock, GraduationCap, AlertCircle, User, Briefcase, Award } from 'lucide-react'

import api from '@/configs/axios'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import Loading from '../../components/Loading'

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

      {/* Hero Section - Centered with pink accents */}
      <section className='bg-gradient-to-r from-pink-50 via-pink-100 to-pink-50 py-12 relative overflow-hidden'>
        <div className='absolute inset-0 bg-grid-pink-100 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.6),rgba(255,255,255,1))] opacity-20'></div>
        <div className='max-w-4xl mx-auto px-4 text-center relative z-10'>
          <div className='inline-block bg-pink-100 text-pink-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4'>
            Tư vấn sức khỏe sinh sản
          </div>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            Đặt lịch tư vấn với
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-600 px-2'>
              chuyên gia
            </span>
            của chúng tôi
          </h1>
          <p className='text-gray-600 max-w-2xl mx-auto text-lg'>
            Đội ngũ chuyên gia với kinh nghiệm và chuyên môn cao sẽ giúp bạn giải đáp mọi thắc mắc
          </p>
          {!userInfo && (
            <div className='inline-flex items-center gap-2 text-pink-700 bg-pink-50 border border-pink-200 rounded-lg px-4 py-2 text-sm mt-6'>
              <AlertCircle className='w-4 h-4' />
              <span>Bạn có thể đặt lịch mà không cần đăng nhập</span>
            </div>
          )}
        </div>
      </section>

      {/* Consultants Section - Centered cards with pink theme */}
      <section className='py-16 bg-white'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6'>
          <div className='text-center mb-12'>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'>
              Đội ngũ
              <span className='text-pink-600 px-2'>chuyên gia tư vấn</span>
              của chúng tôi
            </h2>
            <div className='w-20 h-1 bg-gradient-to-r from-pink-400 to-pink-600 mx-auto mt-3 mb-4 rounded-full'></div>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              Chọn chuyên gia phù hợp với nhu cầu của bạn và đặt lịch ngay hôm nay
            </p>
          </div>

          {loading ? (
            <Loading />
          ) : consultants.length === 0 ? (
            <div className='text-center py-16 max-w-md mx-auto'>
              <div className='w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-pink-100'>
                <User className='w-10 h-10 text-pink-400' />
              </div>
              <p className='text-gray-500 text-lg'>Chưa có tư vấn viên nào trong hệ thống</p>
            </div>
          ) : (
            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-8'>
              {consultants.map((consultant) => (
                <Card
                  key={consultant.id}
                  className='group overflow-hidden rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300'
                >
                  <CardContent className='p-0'>
                    {/* Compact consultant card design with pink accents */}
                    <div className='p-6'>
                      <div className='flex flex-col items-center text-center mb-4'>
                        {/* Avatar with colored background - centered */}
                        <div className='mb-3'>
                          {consultant.avatarUrl ? (
                            <img
                              src={consultant.avatarUrl}
                              alt={consultant.fullName}
                              className='h-24 w-24 rounded-full object-cover border-4 border-white shadow-md'
                              loading='lazy'
                            />
                          ) : (
                            <div className='h-24 w-24 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-bold text-2xl shadow-md'>
                              {getInitialAvatar(consultant.fullName)}
                            </div>
                          )}
                        </div>

                        {/* Consultant name and role - centered */}
                        <div className='text-center'>
                          <h3 className='font-bold text-xl text-gray-900 group-hover:text-pink-600 transition-colors mb-1'>
                            {consultant.fullName}
                          </h3>

                          {consultant.department && (
                            <div className='inline-flex items-center gap-1 text-pink-600 font-medium text-sm'>
                              <Briefcase className='w-3.5 h-3.5' />
                              {consultant.department}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Qualification badges - centered */}
                      <div className='flex justify-center flex-wrap gap-2 mb-4'>
                        {consultant.yearOfExperience > 0 && (
                          <div className='bg-pink-50 border border-pink-200 text-pink-700 text-xs font-medium rounded-full py-1 px-3 flex items-center'>
                            <Award className='w-3 h-3 mr-1' />
                            <span>{consultant.yearOfExperience}+ năm kinh nghiệm</span>
                          </div>
                        )}

                        {consultant.degree && (
                          <div className='bg-pink-50 border border-pink-200 text-pink-700 text-xs font-medium rounded-full py-1 px-3 flex items-center'>
                            <GraduationCap className='w-3 h-3 mr-1' />
                            <span className='truncate max-w-[150px]'>{consultant.degree}</span>
                          </div>
                        )}
                      </div>

                      {/* Biography - styled with pink accents */}
                      {consultant.biography && (
                        <div className='mb-5'>
                          <p className='text-sm text-gray-600 italic p-3 bg-pink-50 border-l-2 border-pink-300 rounded'>
                            "
                            {consultant.biography.length > 120
                              ? `${consultant.biography.slice(0, 120)}...`
                              : consultant.biography}
                            "
                          </p>
                        </div>
                      )}

                      {/* Booking button with pink theme */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className='w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium py-2 flex items-center justify-center gap-2 shadow-sm'
                            onClick={() => setSelectedConsultant(consultant)}
                          >
                            <Calendar className='w-4 h-4' />
                            Đặt lịch tư vấn
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-md bg-white'>
                          <DialogHeader>
                            <DialogTitle className='flex items-center gap-2 text-pink-600 text-center w-full justify-center mb-2'>
                              <Calendar className='w-5 h-5' />
                              <span>Đặt lịch với {consultant.fullName}</span>
                            </DialogTitle>
                          </DialogHeader>

                          {/* Booking form with pink theme */}
                          <form onSubmit={handleBookingSubmit} className='mt-4 space-y-4'>
                            {/* Consultant info panel - centered */}
                            <div className='bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-lg flex flex-col items-center text-center'>
                              {consultant.avatarUrl ? (
                                <img
                                  src={consultant.avatarUrl}
                                  alt={consultant.fullName}
                                  className='h-16 w-16 rounded-full object-cover border-2 border-white shadow mb-2'
                                />
                              ) : (
                                <div className='h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-bold text-xl mb-2'>
                                  {getInitialAvatar(consultant.fullName)}
                                </div>
                              )}
                              <div>
                                <h4 className='font-medium text-gray-900'>{consultant.fullName}</h4>
                                <p className='text-sm text-pink-600'>{consultant.department || 'Chuyên gia tư vấn'}</p>
                              </div>
                            </div>

                            {/* Guest info section - only shown when not logged in */}
                            {!userInfo ? (
                              <div className='space-y-3 border border-gray-200 rounded-lg p-4'>
                                <h4 className='font-medium text-sm text-gray-700'>Thông tin cá nhân</h4>
                                <div className='grid grid-cols-1 gap-3'>
                                  <div className='space-y-1'>
                                    <label className='text-xs font-medium text-gray-700'>Họ và tên</label>
                                    <input
                                      type='text'
                                      name='guestName'
                                      value={formData.guestName}
                                      onChange={handleFormChange}
                                      required
                                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500'
                                    />
                                  </div>
                                  <div className='grid grid-cols-2 gap-3'>
                                    <div className='space-y-1'>
                                      <label className='text-xs font-medium text-gray-700'>Email</label>
                                      <input
                                        type='email'
                                        name='guestEmail'
                                        value={formData.guestEmail}
                                        onChange={handleFormChange}
                                        required
                                        className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500'
                                      />
                                    </div>
                                    <div className='space-y-1'>
                                      <label className='text-xs font-medium text-gray-700'>Số điện thoại</label>
                                      <input
                                        type='tel'
                                        name='guestPhone'
                                        value={formData.guestPhone}
                                        onChange={handleFormChange}
                                        required
                                        className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500'
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className='bg-pink-50 border border-pink-100 p-3 rounded-lg'>
                                <div className='flex items-center gap-3'>
                                  <div className='h-10 w-10 flex items-center justify-center rounded-full overflow-hidden bg-pink-100'>
                                    {userInfo.avatarUrl ? (
                                      <img
                                        src={userInfo.avatarUrl}
                                        alt={userInfo.fullName}
                                        className='h-full w-full object-cover'
                                      />
                                    ) : (
                                      <span className='text-sm font-medium text-pink-600'>
                                        {getInitialAvatar(userInfo.fullName)}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className='text-sm font-medium text-gray-900'>{userInfo.fullName}</p>
                                    <p className='text-xs text-gray-500'>{userInfo.email}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Date and time selection */}
                            <div className='grid grid-cols-2 gap-3'>
                              <div className='space-y-1'>
                                <label className='text-xs font-medium text-gray-700 flex items-center gap-1'>
                                  <Calendar className='w-3.5 h-3.5' />
                                  Ngày tư vấn
                                </label>
                                <input
                                  type='date'
                                  name='scheduledDate'
                                  value={formData.scheduledDate}
                                  onChange={handleFormChange}
                                  min={new Date().toISOString().split('T')[0]}
                                  required
                                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500'
                                />
                              </div>
                              <div className='space-y-1'>
                                <label className='text-xs font-medium text-gray-700 flex items-center gap-1'>
                                  <Clock className='w-3.5 h-3.5' />
                                  Giờ tư vấn
                                </label>
                                <select
                                  name='scheduledTime'
                                  value={formData.scheduledTime}
                                  onChange={handleFormChange}
                                  required
                                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500'
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
                            </div>

                            {/* Message textarea */}
                            <div className='space-y-1'>
                              <label className='text-xs font-medium text-gray-700 flex items-center gap-1'>
                                <MessageSquare className='w-3.5 h-3.5' />
                                Nội dung cần tư vấn
                              </label>
                              <textarea
                                name='message'
                                value={formData.message}
                                onChange={handleFormChange}
                                rows={3}
                                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500'
                                placeholder='Mô tả vấn đề bạn cần tư vấn...'
                              ></textarea>
                            </div>

                            {/* Hidden input */}
                            <input type='hidden' name='staffId' value={selectedConsultant?.id || ''} />

                            {/* Submit button */}
                            <Button
                              type='submit'
                              className='w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium shadow'
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

      {/* Feature section - pink theme */}
      <section className='bg-pink-50 py-16'>
        <div className='max-w-4xl mx-auto px-4'>
          <div className='text-center mb-10'>
            <h3 className='text-2xl font-bold text-gray-900 mb-2'>Tại sao nên đặt tư vấn với chúng tôi?</h3>
            <div className='w-16 h-1 bg-pink-400 mx-auto mb-4 rounded-full'></div>
            <p className='text-gray-600 max-w-2xl mx-auto'>Dịch vụ tư vấn trực tuyến tiện lợi và chuyên nghiệp</p>
          </div>

          <div className='grid sm:grid-cols-3 gap-6'>
            {[
              {
                icon: <User className='h-6 w-6 text-pink-400' />,
                title: 'Chuyên gia hàng đầu',
                description: 'Đội ngũ chuyên gia có trình độ chuyên môn cao và kinh nghiệm thực tiễn.'
              },
              {
                icon: <Calendar className='h-6 w-6 text-pink-400' />,
                title: 'Đặt lịch linh hoạt',
                description: 'Chọn thời gian tư vấn phù hợp với lịch trình của bạn.'
              },
              {
                icon: <MessageSquare className='h-6 w-6 text-pink-400' />,
                title: 'Tư vấn chi tiết',
                description: 'Giải đáp mọi thắc mắc và nhận tư vấn chuyên sâu về sức khỏe.'
              }
            ].map((feature, idx) => (
              <Card key={idx} className='border-0 shadow-sm text-center'>
                <CardContent className='p-6'>
                  <div className='h-14 w-14 rounded-full bg-pink-100 flex items-center justify-center mb-4 mx-auto'>
                    {feature.icon}
                  </div>
                  <h4 className='text-lg font-semibold text-gray-900 mb-2'>{feature.title}</h4>
                  <p className='text-gray-600'>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default BookingConsultant
