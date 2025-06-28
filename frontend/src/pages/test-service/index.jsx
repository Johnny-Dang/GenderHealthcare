import React, { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Phone, Shield, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from '@/configs/axios'
import ServiceBookingForm from '@/components/ServiceBookingForm'

const Services = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [categories, setCategories] = useState(['Tất cả'])
  const [categoryInput, setCategoryInput] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState(null)

  const fetchServices = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/services')
      console.log(response)

      setServices(response.data)
    } catch (error) {
      console.error('Lỗi khi lấy danh mục dịch vụ:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchServices()
  }, [])

  return (
    <div className='min-h-screen'>
      <Navigation />

      {/* Hero Section */}
      <section className='bg-gradient-soft py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h1 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-6'>
            <span className='gradient-text'>Xét nghiệm</span> bệnh xã hội
          </h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto mb-8'>
            Dịch vụ xét nghiệm chuyên nghiệp, bảo mật và chính xác các bệnh lây truyền qua đường tình dục
          </p>
          <div className='flex flex-wrap justify-center gap-6 text-sm'>
            <div className='flex items-center gap-2'>
              <Shield className='w-5 h-5 text-green-500' />
              <span>Bảo mật tuyệt đối</span>
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle className='w-5 h-5 text-green-500' />
              <span>Chất lượng cao</span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='w-5 h-5 text-green-500' />
              <span>Kết quả nhanh</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className='py-8 border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-wrap gap-4 justify-center mb-4'>
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? 'default' : 'outline'}
                className={category === selectedCategory ? 'bg-gradient-primary text-white' : ''}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          <div className='flex justify-center mb-4 gap-2'>
            <input
              type='text'
              className='border rounded px-3 py-2 min-w-[200px]'
              placeholder='Nhập tên danh mục...'
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setSelectedCategory('')
              }}
            />
            <Button onClick={() => setSelectedCategory('')}>Lọc</Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {loading ? (
            <div>Đang tải...</div>
          ) : (
            <div className='grid lg:grid-cols-3 md:grid-cols-2 gap-8'>
              {services.map((service) => (
                <Card
                  key={service.serviceId}
                  className='border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden'
                >
                  <div className='aspect-video overflow-hidden'>
                    <img
                      src={service.imageUrl || 'https://placehold.co/400x250?text=No+Image'}
                      alt={service.serviceName}
                      className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
                    />
                  </div>
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-full'>
                        {service.category}
                      </span>
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-3'>{service.serviceName}</h3>
                    <p className='text-gray-600 mb-4'>{service.description}</p>
                    <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
                      <div className='flex items-center gap-1'>
                        <Clock className='w-4 h-4' />
                        <span>{service.createdAt ? new Date(service.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='text-2xl font-bold text-primary-600'>{service.price?.toLocaleString()} VNĐ</div>
                    </div>
                    <Button
                      className='w-full bg-gradient-primary hover:opacity-90 text-white'
                      onClick={() => {
                        setSelectedServiceId(service.serviceId)
                        setOpenForm(true)
                      }}
                    >
                      Đặt Dịch Vụ
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        {/* Form popup đặt dịch vụ */}
        <ServiceBookingForm
          open={openForm}
          onOpenChange={setOpenForm}
          serviceId={selectedServiceId}
          onSuccess={() => {}}
        />
      </section>

      {/* Why Choose Us */}
      <section className='py-16 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>Tại sao chọn chúng tôi?</h2>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              Chúng tôi cam kết mang đến dịch vụ xét nghiệm chất lượng cao với sự bảo mật tuyệt đối
            </p>
          </div>
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <Shield className='w-12 h-12 text-primary-500 mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Bảo mật thông tin</h3>
              <p className='text-gray-600'>
                Thông tin cá nhân và kết quả xét nghiệm được bảo mật tuyệt đối theo tiêu chuẩn quốc tế
              </p>
            </div>
            <div className='text-center'>
              <CheckCircle className='w-12 h-12 text-primary-500 mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Chất lượng cao</h3>
              <p className='text-gray-600'>
                Sử dụng công nghệ hiện đại với chất lượng xét nghiệm được kiểm soát nghiêm ngặt
              </p>
            </div>
            <div className='text-center'>
              <Clock className='w-12 h-12 text-primary-500 mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Kết quả nhanh</h3>
              <p className='text-gray-600'>Kết quả nhanh chóng từ 15 phút đến trong ngày</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className='py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl font-bold text-gray-900 mb-8'>Đặt lịch xét nghiệm</h2>
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='flex flex-col items-center'>
              <Phone className='w-12 h-12 text-primary-500 mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Hotline 24/7</h3>
              <p className='text-gray-600'>1900 1234</p>
            </div>
            <div className='flex flex-col items-center'>
              <MapPin className='w-12 h-12 text-primary-500 mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Địa chỉ</h3>
              <p className='text-gray-600'>123 Đường ABC, Quận 1, TP.HCM</p>
            </div>
            <div className='flex flex-col items-center'>
              <Clock className='w-12 h-12 text-primary-500 mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Giờ làm việc</h3>
              <p className='text-gray-600'>T2-CN: 7:00 - 19:00</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Services
