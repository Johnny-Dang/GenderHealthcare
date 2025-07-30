import { Button } from 'antd'
import { ClockIcon, Mail, MapPin, Phone } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const PreFooter = ({ contactRef, isVisible }) => {
  // Thông tin liên hệ
  const [contactInfo] = useState({
    address: 'Tòa nhà BS16 The Oasis, Vinhomes Grand Park, Quận 9, Tp. Hồ Chí Minh',
    phone: '1900 1234 567',
    email: 'info@wellcare.vn',
    workingHours: [
      { days: 'Thứ 2 - Thứ 6', hours: '7:30 - 17:30' },
      { days: 'Thứ 7', hours: '8:00 - 16:00' },
      { days: 'Chủ nhật', hours: '8:00 - 12:00' }
    ],
    mapUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4946681012693!2d106.70093145092787!3d10.771600992283384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670702e31%3A0xa5777fb3a5d0d14f!2zMTIzIE5ndXnhu4VuIEh14buHLCBC4bq_biBOZ2jDqSwgUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1660125399332!5m2!1svi!2s',
    socialMedia: {
      facebook: 'https://facebook.com/wellcare',
      instagram: 'https://instagram.com/wellcare',
      youtube: 'https://youtube.com/wellcare'
    }
  })
  return (
    <>
      {/* Thông tin liên hệ và địa điểm */}
      <section ref={contactRef} className='py-16 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div
            className={`text-center mb-12 transition-all duration-700 ${isVisible.contact ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-6'>
              Thông tin <span className='gradient-text'>liên hệ</span>
            </h2>
            <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
              Bạn có thể dễ dàng tìm thấy chúng tôi hoặc liên hệ qua các kênh dưới đây
            </p>
          </div>

          <div className='grid lg:grid-cols-5 gap-8'>
            {/* Bản đồ Google Maps */}
            <div
              className={`lg:col-span-3 rounded-xl overflow-hidden shadow-md h-auto flex transition-all duration-1000 ${isVisible.contact ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
              style={{ height: '100%' }}
            >
              <iframe
                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.5272031630207!2d106.84166977451802!3d10.84744815788076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317521003765a9f5%3A0x8ea99e10017a1831!2sT%C3%B2a%20BS16%20-%20The%20Oasis%20-%20Vinhomes%20Grand%20Park!5e0!3m2!1svi!2s!4v1751703515467!5m2!1svi!2s'
                width='100%'
                height='100%'
                style={{ border: 0 }}
                allowFullScreen=''
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
              ></iframe>
            </div>

            {/* Thông tin liên hệ */}
            <div
              className={`lg:col-span-2 space-y-6 transition-all duration-1000 ${isVisible.contact ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
            >
              <div className='bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-500'>
                <h3 className='text-xl font-semibold mb-6 text-gray-900'>Thông tin liên hệ</h3>

                <div className='space-y-5'>
                  <div className='flex items-start group'>
                    <div className='w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 group-hover:bg-primary-200'>
                      <MapPin className='w-5 h-5 text-primary-600' />
                    </div>
                    <div className='ml-4'>
                      <h4 className='text-sm font-medium text-gray-700'>Địa chỉ</h4>
                      <p className='text-gray-600 mt-1'>{contactInfo.address}</p>
                    </div>
                  </div>

                  <div className='flex items-start group'>
                    <div className='w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 group-hover:bg-primary-200'>
                      <Phone className='w-5 h-5 text-primary-600' />
                    </div>
                    <div className='ml-4'>
                      <h4 className='text-sm font-medium text-gray-700'>Hotline (24/7)</h4>
                      <p className='text-gray-600 mt-1'>{contactInfo.phone}</p>
                    </div>
                  </div>

                  <div className='flex items-start group'>
                    <div className='w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 group-hover:bg-primary-200'>
                      <Mail className='w-5 h-5 text-primary-600' />
                    </div>
                    <div className='ml-4'>
                      <h4 className='text-sm font-medium text-gray-700'>Email</h4>
                      <p className='text-gray-600 mt-1'>{contactInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-500'>
                <h3 className='text-xl font-semibold mb-6 text-gray-900'>Giờ làm việc</h3>

                <div className='space-y-4'>
                  {contactInfo.workingHours.map((item, index) => (
                    <div key={index} className='flex items-start group'>
                      <div className='w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 group-hover:bg-primary-200'>
                        <ClockIcon className='w-5 h-5 text-primary-600' />
                      </div>
                      <div className='ml-4'>
                        <h4 className='text-sm font-medium text-gray-700'>{item.days}</h4>
                        <p className='text-gray-600 mt-1'>{item.hours}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kêu gọi hành động */}
      <section className='py-16 bg-white'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl font-bold text-gray-900 mb-6'>Sẵn sàng chăm sóc sức khỏe của bạn?</h2>
          <p className='text-lg text-gray-600 mb-8 max-w-3xl mx-auto'>
            Hãy đặt lịch tư vấn hoặc khám sức khỏe ngay hôm nay để nhận được sự chăm sóc tốt nhất từ đội ngũ chuyên gia
            của chúng tôi.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button asChild size='lg' className='bg-primary text-white px-8 py-3 font-medium rounded-lg'>
              <Link to='/test-service'>Đặt lịch ngay</Link>
            </Button>
            <Button
              asChild
              variant='outline'
              className='px-6 py-3 border border-primary-600 text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-all duration-300 hover:shadow-md hover:-translate-y-1'
            >
              <Link to='/booking-consultant'>Liên hệ tư vấn</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

export default PreFooter
