import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Calendar, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Services = () => {
  const navigate = useNavigate()

  const services = [
    {
      icon: Heart,
      title: 'Xét nghiệm sức khỏe',
      description: 'Gói xét nghiệm toàn diện về sức khỏe sinh sản, hormone và phát hiện sớm các bệnh phụ khoa.',
      features: ['Xét nghiệm hormone', 'Tầm soát ung thư', 'Kiểm tra STD', 'Xét nghiệm tiền hôn nhân'],
      link: '/test-service'
    },
    {
      icon: MessageSquare,
      title: 'Tư vấn chuyên khoa',
      description: 'Tư vấn riêng tư với các chuyên gia hàng đầu về sức khỏe giới tính và sinh sản.',
      features: ['Tư vấn trực tuyến', 'Khám định kỳ', 'Tư vấn tâm lý', 'Hỗ trợ 24/7'],
      link: '/booking-consultant'
    },
    {
      icon: Calendar,
      title: 'Theo dõi chu kỳ',
      description: 'Ứng dụng thông minh giúp theo dõi và dự đoán chu kỳ kinh nguyệt một cách chính xác.',
      features: ['Dự đoán chu kỳ', 'Nhắc nhở thông minh', 'Theo dõi triệu chứng', 'Báo cáo sức khỏe'],
      link: '/cycle-tracking'
    }
  ]

  // Hàm xử lý điều hướng
  const handleNavigate = (path) => {
    navigate(path)
  }

  return (
    <section className='py-20 bg-gradient-soft'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-6'>
            Dịch vụ <span className='gradient-text'>chuyên nghiệp</span>
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Chúng tôi cung cấp đầy đủ các dịch vụ chăm sóc sức khỏe giới tính từ cơ bản đến chuyên sâu
          </p>
        </div>

        <div className='grid lg:grid-cols-3 gap-8'>
          {services.map((service, index) => (
            <Card
              key={index}
              className='border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white'
            >
              <CardContent className='p-8'>
                <div className='w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6'>
                  <service.icon className='w-8 h-8 text-white' />
                </div>

                <h3 className='text-2xl font-bold text-gray-900 mb-4'>{service.title}</h3>
                <p className='text-gray-600 mb-6 leading-relaxed'>{service.description}</p>

                <ul className='space-y-3 mb-8'>
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className='flex items-center text-sm text-gray-600'>
                      <div className='w-2 h-2 bg-primary-500 rounded-full mr-3'></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className='w-full bg-gradient-primary hover:opacity-90 text-white'
                  onClick={() => handleNavigate(service.link)}
                >
                  Tìm hiểu thêm
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
