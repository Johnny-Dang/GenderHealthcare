import React, { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, MessageSquare, Heart, Star, Award, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const BookingConsultant = () => {
  useEffect(() => {
    window.scrollTo(0, 0) // ⬆️ Scroll lên đầu khi load trang
  }, [])
  const [selectedConsultationType, setSelectedConsultationType] = useState('')

  const consultationTypes = [
    {
      icon: MessageSquare,
      title: 'Tư vấn trực tuyến',
      description: 'Tư vấn riêng tư qua video call với bác sĩ chuyên khoa',
      duration: '30-45 phút',
      price: '500.000đ'
    },
    {
      icon: Calendar,
      title: 'Khám trực tiếp',
      description: 'Khám tại phòng khám với đội ngũ bác sĩ giàu kinh nghiệm',
      duration: '60 phút',
      price: '800.000đ'
    },
    {
      icon: Heart,
      title: 'Tư vấn tâm lý',
      description: 'Hỗ trợ tâm lý cho các vấn đề về sức khỏe giới tính',
      duration: '45 phút',
      price: '600.000đ'
    }
  ]

  const consultants = [
    {
      id: 1,
      name: 'BS. Nguyễn Thị Lan',
      specialty: 'Sản phụ khoa',
      experience: '15 năm kinh nghiệm',
      education: 'Tiến sĩ Y khoa - Đại học Y Hà Nội',
      rating: 4.9,
      reviews: 245,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      achievements: ['Chuyên gia hàng đầu về sức khỏe phụ nữ', 'Giải thưởng Bác sĩ xuất sắc 2023']
    },
    {
      id: 2,
      name: 'BS. Trần Văn Nam',
      specialty: 'Nội tiết sinh sản',
      experience: '12 năm kinh nghiệm',
      education: 'Thạc sĩ Y khoa - Đại học Y TP.HCM',
      rating: 4.8,
      reviews: 189,
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      achievements: ['Chuyên gia về hormone sinh sản', 'Nghiên cứu viên tại Viện Y học']
    },
    {
      id: 3,
      name: 'BS. Lê Thị Hoa',
      specialty: 'Tâm lý sức khỏe',
      experience: '10 năm kinh nghiệm',
      education: 'Thạc sĩ Tâm lý học - Đại học Quốc gia',
      rating: 4.9,
      reviews: 156,
      avatar: 'https://anhcute.net/wp-content/uploads/2024/10/Hinh-chibi-bac-si-nu.jpeg',
      achievements: ['Chuyên gia tư vấn tâm lý', 'Chứng chỉ quốc tế về CBT']
    }
  ]

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    console.log('Booking submitted')
    alert('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.')
  }

  return (
    <div className='min-h-screen'>
      <Navigation />

      <section className='bg-gradient-soft py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h1 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-6'>
            Đặt lịch <span className='gradient-text'>tư vấn</span>
          </h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Được tư vấn bởi đội ngũ chuyên gia hàng đầu về sức khỏe giới tính
          </p>
        </div>
      </section>

      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-3 gap-8 mb-16'>
            {consultationTypes.map((type, index) => (
              <Card
                key={index}
                className='border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2'
              >
                <CardContent className='p-8 text-center'>
                  <div className='w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6'>
                    <type.icon className='w-8 h-8 text-white' />
                  </div>
                  <h3 className='text-2xl font-bold text-gray-900 mb-4'>{type.title}</h3>
                  <p className='text-gray-600 mb-4'>{type.description}</p>
                  <div className='space-y-2 mb-6'>
                    <div className='text-sm text-gray-500'>Thời gian: {type.duration}</div>
                    <div className='text-2xl font-bold text-primary-600'>{type.price}</div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className='w-full bg-gradient-primary hover:opacity-90 text-white'
                        onClick={() => setSelectedConsultationType(type.title)}
                      >
                        Đặt lịch ngay
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-md'>
                      <DialogHeader>
                        <DialogTitle>Đặt lịch {type.title}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleBookingSubmit} className='space-y-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Họ và tên</label>
                          <input
                            type='text'
                            required
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Số điện thoại</label>
                          <input
                            type='tel'
                            required
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                          <input
                            type='email'
                            required
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Ngày mong muốn</label>
                          <input
                            type='date'
                            required
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Giờ mong muốn</label>
                          <select
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
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Mô tả vấn đề (tùy chọn)
                          </label>
                          <textarea
                            rows={3}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                          ></textarea>
                        </div>
                        <Button type='submit' className='w-full bg-gradient-primary hover:opacity-90 text-white'>
                          Xác nhận đặt lịch
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-6'>
              Đội ngũ <span className='gradient-text'>tư vấn viên</span>
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Các chuyên gia giàu kinh nghiệm, tận tâm chăm sóc sức khỏe của bạn
            </p>
          </div>

          <div className='grid lg:grid-cols-3 gap-8'>
            {consultants.map((consultant) => (
              <Card
                key={consultant.id}
                className='border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2'
              >
                <CardContent className='p-8 text-center'>
                  <div className='relative inline-block mb-6'>
                    <img
                      src={consultant.avatar}
                      alt={consultant.name}
                      className='w-24 h-24 rounded-full object-cover mx-auto'
                    />
                    <div className='absolute -bottom-2 -right-2 bg-gradient-primary text-white rounded-full p-2'>
                      <Award className='w-4 h-4' />
                    </div>
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-2'>{consultant.name}</h3>
                  <p className='text-primary-600 font-medium mb-2'>{consultant.specialty}</p>
                  <p className='text-gray-600 mb-4'>{consultant.experience}</p>
                  <div className='flex items-center justify-center gap-1 mb-4'>
                    <Star className='w-4 h-4 text-yellow-400 fill-current' />
                    <span className='font-medium'>{consultant.rating}</span>
                    <span className='text-gray-500'>({consultant.reviews} đánh giá)</span>
                  </div>
                  <div className='space-y-3 mb-6'>
                    <div className='bg-gray-50 p-3 rounded-lg'>
                      <p className='text-sm font-medium text-gray-700'>Học vấn:</p>
                      <p className='text-sm text-gray-600'>{consultant.education}</p>
                    </div>
                    <div className='space-y-2'>
                      {consultant.achievements.map((achievement, index) => (
                        <div key={index} className='flex items-center text-sm text-gray-600'>
                          <Users className='w-4 h-4 text-primary-500 mr-2' />
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className='w-full bg-gradient-primary hover:opacity-90 text-white'>Đặt lịch ngay</Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-md'>
                      <DialogHeader>
                        <DialogTitle>Đặt lịch với {consultant.name}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleBookingSubmit} className='space-y-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Họ và tên</label>
                          <input
                            type='text'
                            required
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Số điện thoại</label>
                          <input
                            type='tel'
                            required
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
                          <input
                            type='email'
                            required
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Ngày mong muốn</label>
                          <input
                            type='date'
                            required
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>Giờ mong muốn</label>
                          <select
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
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Mô tả vấn đề (tùy chọn)
                          </label>
                          <textarea
                            rows={3}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                          ></textarea>
                        </div>
                        <Button type='submit' className='w-full bg-gradient-primary hover:opacity-90 text-white'>
                          Xác nhận đặt lịch
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
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
