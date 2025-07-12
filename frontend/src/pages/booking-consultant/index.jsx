import React, { useState } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ConsultantList from '@/components/ConsultantList'
import ConsultantBookingDialog from '@/components/ConsultantBookingDialog'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, MessageSquare, AlertCircle, User } from 'lucide-react'
import { useSelector } from 'react-redux'

const BookingConsultant = () => {
  const userInfo = useSelector((state) => state.user.userInfo)
  const [selectedConsultant, setSelectedConsultant] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleConsultantSelect = (consultant) => {
    setSelectedConsultant(consultant)
    setIsDialogOpen(true)
  }

  const handleBookingSuccess = () => {
    setSelectedConsultant(null)
    setIsDialogOpen(false)
  }

  return (
    <div className='min-h-screen'>
      <Navigation />

      {/* Hero Section - Styled with system colors */}
      <section className='bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 py-12 relative overflow-hidden'>
        <div className='absolute inset-0 bg-grid-primary-100 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.6),rgba(255,255,255,1))] opacity-20'></div>
        <div className='max-w-4xl mx-auto px-4 text-center relative z-10'>
          <div className='inline-block bg-primary-100 text-primary-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4'>
            Tư vấn sức khỏe sinh sản
          </div>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            Đặt lịch tư vấn với
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500 px-2'>
              chuyên gia
            </span>
            của chúng tôi
          </h1>
          <p className='text-gray-600 max-w-2xl mx-auto text-lg'>
            Đội ngũ chuyên gia với kinh nghiệm và chuyên môn cao sẽ giúp bạn giải đáp mọi thắc mắc
          </p>
          {!userInfo && (
            <div className='inline-flex items-center gap-2 text-primary-700 bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-sm mt-6'>
              <AlertCircle className='w-4 h-4' />
              <span>Bạn có thể đặt lịch mà không cần đăng nhập</span>
            </div>
          )}
        </div>
      </section>

      {/* Consultants Section - Styled with system colors */}
      <section className='py-16 bg-white'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6'>
          <div className='text-center mb-12'>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2'>
              Đội ngũ
              <span className='text-primary-600 px-2'>chuyên gia tư vấn</span>
              của chúng tôi
            </h2>
            <div className='w-20 h-1 bg-gradient-to-r from-primary-400 to-secondary-500 mx-auto mt-3 mb-4 rounded-full'></div>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              Chọn chuyên gia phù hợp với nhu cầu của bạn và đặt lịch ngay hôm nay
            </p>
          </div>

          <ConsultantList
            onConsultantSelect={handleConsultantSelect}
            gridCols='sm:grid-cols-2 lg:grid-cols-3'
            cardClassName='group overflow-hidden rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300'
          />
        </div>
      </section>

      {/* Feature section with system theme */}
      <section className='bg-primary-50 py-16'>
        <div className='max-w-4xl mx-auto px-4'>
          <div className='text-center mb-10'>
            <h3 className='text-2xl font-bold text-gray-900 mb-2'>Tại sao nên đặt tư vấn với chúng tôi?</h3>
            <div className='w-16 h-1 bg-primary-400 mx-auto mb-4 rounded-full'></div>
            <p className='text-gray-600 max-w-2xl mx-auto'>Dịch vụ tư vấn trực tuyến tiện lợi và chuyên nghiệp</p>
          </div>

          <div className='grid sm:grid-cols-3 gap-6'>
            {[
              {
                icon: <User className='h-6 w-6 text-primary-400' />,
                title: 'Chuyên gia hàng đầu',
                description: 'Đội ngũ chuyên gia có trình độ chuyên môn cao và kinh nghiệm thực tiễn.'
              },
              {
                icon: <Calendar className='h-6 w-6 text-primary-400' />,
                title: 'Đặt lịch linh hoạt',
                description: 'Chọn thời gian tư vấn phù hợp với lịch trình của bạn.'
              },
              {
                icon: <MessageSquare className='h-6 w-6 text-primary-400' />,
                title: 'Tư vấn chi tiết',
                description: 'Giải đáp mọi thắc mắc và nhận tư vấn chuyên sâu về sức khỏe.'
              }
            ].map((feature, idx) => (
              <Card key={idx} className='border-0 shadow-sm text-center'>
                <CardContent className='p-6'>
                  <div className='h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center mb-4 mx-auto'>
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

      {/* Booking Dialog */}
      <ConsultantBookingDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        consultant={selectedConsultant}
        onBookingSuccess={handleBookingSuccess}
      />

      <Footer />
    </div>
  )
}

export default BookingConsultant
