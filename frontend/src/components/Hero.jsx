import React from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className='relative bg-gradient-soft min-h-[80vh] flex items-center overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-br from-primary-50/50 to-secondary-50/50'></div>

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          {/* Content */}
          <div className='space-y-8 animate-slide-in'>
            <div className='inline-flex items-center px-4 py-2 bg-white/80 rounded-full text-sm font-medium text-primary-600 border border-primary-200'>
              <Heart className='w-4 h-4 mr-2' />
              Chăm sóc sức khỏe toàn diện
            </div>

            <h1 className='text-4xl lg:text-6xl font-bold text-gray-900 leading-tight'>
              Chăm sóc <span className='gradient-text'>sức khỏe giới tính</span> của bạn
            </h1>

            <p className='text-lg text-gray-600 max-w-xl'>
              WellCare cung cấp dịch vụ chăm sóc sức khỏe giới tính chuyên nghiệp, tư vấn riêng tư và các giải pháp y tế
              hiện đại nhất.
            </p>

            <div className='flex flex-col sm:flex-row gap-4'>
              <Button asChild size='lg' className='bg-gradient-primary hover:opacity-90 text-white px-8'>
                <Link to='/booking-consultant'>Đặt lịch tư vấn</Link>
              </Button>

              <Button size='lg' variant='outline' className='border-primary-200 text-primary-600 hover:bg-primary-50'>
                Tìm hiểu thêm
              </Button>
            </div>

            <div className='flex items-center space-x-6 pt-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-primary-600'>10k+</div>
                <div className='text-sm text-gray-500'>Khách hàng tin tưởng</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-primary-600'>95%</div>
                <div className='text-sm text-gray-500'>Hài lòng dịch vụ</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-primary-600'>24/7</div>
                <div className='text-sm text-gray-500'>Hỗ trợ khẩn cấp</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className='relative animate-fade-in'>
            <div className='relative'>
              <img
                src='https://images.unsplash.com/photo-1649972904349-6e44c42644a7'
                alt='Chăm sóc sức khỏe'
                className='rounded-2xl shadow-2xl w-full h-[500px] object-cover'
              />
              <div className='absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border border-gray-100'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center'>
                    <Calendar className='w-5 h-5 text-white' />
                  </div>
                  <div>
                    <div className='font-semibold text-gray-900'>Theo dõi chu kỳ</div>
                    <div className='text-sm text-gray-500'>Miễn phí trọn đời</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
