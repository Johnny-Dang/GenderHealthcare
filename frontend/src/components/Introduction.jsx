import { Card } from 'antd'
import { Calendar, Heart, MessageSquare } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { CardContent } from './ui/card'

const Introduction = () => {
  const [companyInfo, setCompanyInfo] = useState({
    yearsOfExperience: 15,
    totalExperts: 50,
    description: 'WellCare được thành lập với sứ mệnh mang đến dịch vụ chăm sóc sức khỏe giới tính...',
    mission: 'Tạo ra một môi trường y tế an toàn, thân thiện và chuyên nghiệp...'
  })

  // TODO WITH API: Fetch values/services from API
  const [values, setValues] = useState([
    {
      icon: Heart,
      title: 'Chăm sóc tận tâm',
      description:
        'Đội ngũ y bác sĩ giàu kinh nghiệm, tận tâm chăm sóc sức khỏe của bạn với sự riêng tư và chuyên nghiệp cao nhất.'
    },
    {
      icon: Calendar,
      title: 'Theo dõi chu kỳ',
      description:
        'Ứng dụng thông minh giúp theo dõi chu kỳ kinh nguyệt, dự đoán ngày rụng trứng và quản lý sức khỏe sinh sản.'
    },
    {
      icon: MessageSquare,
      title: 'Tư vấn riêng tư',
      description:
        'Dịch vụ tư vấn trực tuyến bảo mật, giúp bạn thoải mái chia sẻ những vấn đề nhạy cảm về sức khỏe giới tính.'
    }
  ])

  return (
    <>
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* About Organization */}
          <div className='grid lg:grid-cols-2 gap-16 items-center mb-20'>
            <div className='space-y-6 animate-slide-in'>
              <h2 className='text-3xl lg:text-4xl font-bold text-gray-900'>
                Về <span className='gradient-text'>WellCare</span>
              </h2>
              <p className='text-lg text-gray-600 leading-relaxed'>{companyInfo.description}</p>
              <p className='text-lg text-gray-600 leading-relaxed'>
                Với đội ngũ y bác sĩ chuyên khoa giàu kinh nghiệm và trang thiết bị y tế hiện đại, WellCare cam kết cung
                cấp các dịch vụ từ tư vấn cơ bản đến điều trị chuyên sâu, giúp phụ nữ tự tin chăm sóc sức khỏe của mình.
              </p>
              <div className='pt-4'>
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <div className='text-2xl font-bold text-primary-600'>{companyInfo.yearsOfExperience}+</div>
                    <div className='text-gray-500'>Năm kinh nghiệm</div>
                  </div>
                  <div>
                    <div className='text-2xl font-bold text-primary-600'>{companyInfo.totalExperts}+</div>
                    <div className='text-gray-500'>Chuyên gia y tế</div>
                  </div>
                </div>
              </div>
            </div>

            <div className='relative animate-fade-in'>
              <img
                src='https://res.cloudinary.com/drks7mngp/image/upload/v1753873695/Gemini_Generated_Image_puclpqpuclpqpucl_vozdgn.png'
                alt='Đội ngũ y tế WellCare'
                className='rounded-2xl shadow-xl w-full h-[455px] object-cover'
              />
            </div>
          </div>

          {/* Mission */}
          <div className='text-center mb-16'>
            <h3 className='text-3xl font-bold text-gray-900 mb-6'>
              Sứ mệnh của <span className='gradient-text'>chúng tôi</span>
            </h3>
            <p className='text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed'>
              Tạo ra một môi trường y tế an toàn, thân thiện và chuyên nghiệp, nơi mọi phụ nữ có thể thoải mái chăm sóc
              sức khỏe giới tính của mình. Chúng tôi tin rằng mỗi phụ nữ đều xứng đáng được tiếp cận với dịch vụ y tế
              chất lượng cao và được tôn trọng.
            </p>
          </div>

          {/* Values */}
          <div className='grid md:grid-cols-3 gap-8'>
            {values.map((value, index) => (
              <Card
                key={index}
                className='border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50'
              >
                <CardContent className='p-8 text-center'>
                  <div className='w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6'>
                    <value.icon className='w-8 h-8 text-white' />
                  </div>
                  <h4 className='text-xl font-semibold text-gray-900 mb-4'>{value.title}</h4>
                  <p className='text-gray-600 leading-relaxed'>{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Introduction
