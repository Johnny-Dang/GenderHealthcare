import React, { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Phone, Shield, CheckCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '@/configs/axios'
import ServiceBookingForm from '@/components/ServiceBookingForm'
import PersonalInfoForm from '@/components/PersonalInfoForm'
import { useSelector } from 'react-redux'

const Services = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [categories, setCategories] = useState(['Tất cả'])
  const [categoryInput, setCategoryInput] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0])
  const [slots, setSlots] = useState(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlotId, setSelectedSlotId] = useState(null)
  const [openPersonalInfoForm, setOpenPersonalInfoForm] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const navigate = useNavigate()
  const accountId = useSelector((state) => state.user.userInfo?.accountId)

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      try {
        const response = await axios.get('/api/services')

        setServices(response.data)
      } catch (error) {
        console.error('Lỗi khi lấy danh mục dịch vụ:', error)
        setServices([])
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  // Gọi API lấy slot khi chọn dịch vụ hoặc đổi ngày
  const fetchSlots = async () => {
    if (selectedServiceId && bookingDate) {
      setLoadingSlots(true)
      setSlots(null)
      try {
        const res = await axios.get(`/api/TestServiceSlot/service/${selectedServiceId}/date/${bookingDate}`)
        setSlots(res.data)
      } catch (err) {
        if (err.response && err.response.status === 401) {
          alert('Bạn cần đăng nhập để đặt lịch.')
          navigate('/login')
          return
        }
        setSlots([])
      } finally {
        setLoadingSlots(false)
      }
    } else {
      setSlots(null)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [selectedServiceId, bookingDate])

  // Lọc dịch vụ theo category chứa chuỗi nhập vào
  const filteredServices = services.filter(service => {
    if (categoryInput.trim() !== '') {
      return service.category?.toLowerCase().includes(categoryInput.trim().toLowerCase())
    }
    if (selectedCategory && selectedCategory !== 'Tất cả') {
      return service.category === selectedCategory
    }
    return true
  })

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

      {/* Categories & Search */}
      <section className='py-8 border-b border-gray-100 bg-white'>
        <div className='max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='flex flex-wrap gap-2'>
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? 'default' : 'outline'}
                className={`rounded-full px-5 py-2 shadow-sm transition-all duration-200 ${category === selectedCategory ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-pink-50'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          <div className='flex gap-2'>
            <input
              type='text'
              className='border border-gray-200 rounded-full px-4 py-2 min-w-[200px] focus:ring-2 focus:ring-pink-400 outline-none shadow-sm'
              placeholder='Nhập tên danh mục...'
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setSelectedCategory('')
              }}
            />
            <Button className='rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white px-5 py-2 shadow-sm hover:opacity-90' onClick={() => setSelectedCategory('')}>Lọc</Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className='py-16 bg-gradient-to-b from-pink-50 to-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-10 items-start'>
            {/* Danh sách dịch vụ */}
            <div className='md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8'>
              {loading ? (
                <div>Đang tải...</div>
              ) : (
                filteredServices.map((service) => (
                  <Card
                    key={service.serviceId}
                    className='flex flex-col h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl bg-white'
                  >
                    <div className='aspect-video overflow-hidden rounded-t-2xl'>
                      <img
                        src={service.imageUrl || 'https://placehold.co/400x250?text=No+Image'}
                        alt={service.serviceName}
                        className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
                      />
                    </div>
                    <CardContent className='flex-1 flex flex-col p-6'>
                      <span className='text-xs bg-pink-100 text-pink-600 px-3 py-1 rounded-full self-start mb-2 font-medium shadow-sm'>
                        {service.category}
                      </span>
                      <h3 className='text-xl font-bold text-gray-900 mb-2'>{service.serviceName}</h3>
                      <p className='text-gray-600 mb-2 flex-1'>{service.description}</p>
                      <div className='flex items-center gap-2 text-sm text-gray-500 mb-2'>
                        <Clock className='w-4 h-4' />
                        <span>{service.createdAt ? new Date(service.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <div className='text-2xl font-bold text-pink-600 mb-4'>
                        {service.price?.toLocaleString()} VNĐ
                      </div>
                      <Button
                        className='bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:opacity-90 text-white w-full rounded-full font-semibold shadow-md'
                        onClick={() => setSelectedServiceId(service.serviceId)}
                      >
                        Chọn dịch vụ
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            {/* Form đặt lịch */}
            <div className='md:col-span-1'>
              <div className='bg-white rounded-2xl shadow-2xl p-8 sticky top-8 min-h-[350px] max-h-screen overflow-y-auto flex flex-col border border-pink-100'>
                <h2 className='text-2xl font-bold mb-6 text-pink-700 text-center tracking-wide'>Thông tin đặt lịch</h2>
                {selectedServiceId ? (
                  (() => {
                    const selectedService = services.find((s) => s.serviceId === selectedServiceId)
                    return selectedService ? (
                      <>
                        <div className='mb-4'>
                          <label className='block text-gray-700 mb-1 font-medium'>Tên dịch vụ</label>
                          <div className='font-semibold text-pink-600'>{selectedService.serviceName}</div>
                        </div>
                        <div className='mb-4'>
                          <label className='block text-gray-700 mb-1 font-medium'>Ngày đặt lịch</label>
                          <input
                            type='date'
                            className='border border-gray-200 rounded-full px-4 py-2 w-full focus:ring-2 focus:ring-pink-400 outline-none shadow-sm mb-2'
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                          />
                        </div>
                        {/* Hiển thị thông tin slot nếu có */}
                        {loadingSlots && <div className='text-gray-500'>Đang tải khung giờ...</div>}
                        {slots && (
                          <div className='mt-6'>
                            <h3 className='font-bold mb-2 text-pink-700'>Thông tin ca:</h3>
                            {slots.length === 0 ? (
                              <div className='text-red-500'>Không có khung giờ khả dụng cho ngày này.</div>
                            ) : (
                              <ul className='space-y-2'>
                                {slots.map((slot) => {
                                  const isSelected = selectedSlotId === slot.slotId
                                  return (
                                    <li
                                      key={slot.slotId}
                                      className={`border rounded-xl p-4 flex flex-col gap-1 transition relative bg-pink-50 hover:bg-pink-100 cursor-pointer shadow-sm ${!slot.isAvailable ? 'opacity-50 cursor-not-allowed' : ''} ${isSelected ? 'ring-2 ring-pink-400' : ''}`}
                                      onClick={() => {
                                        if (slot.isAvailable) setSelectedSlotId(slot.slotId)
                                      }}
                                    >
                                      <div>
                                        <span className='font-semibold'>Ca:</span> {slot.shift}
                                      </div>
                                      <div>
                                        <span className='font-semibold'>Ngày:</span> {slot.slotDate}
                                      </div>
                                      <div>
                                        <span className='font-semibold'>Số lượng còn lại:</span> {slot.availableQuantity}
                                      </div>
                                      <div>
                                        <span className='font-semibold'>Trạng thái:</span>{' '}
                                        {slot.isAvailable ? 'Còn chỗ' : 'Hết chỗ'}
                                      </div>
                                    </li>
                                  )
                                })}
                              </ul>
                            )}
                          </div>
                        )}
                        {/* Nút Tiếp Tục ở dưới cùng form */}
                        {selectedSlotId && slots && (
                          <div className='mt-6'>
                            <Button
                              className='w-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white rounded-full font-semibold py-3 shadow-md hover:opacity-90 transition'
                              onClick={() => {
                                if (!accountId) {
                                  alert('Đăng nhập trước khi chọn dịch vụ')
                                  navigate('/login')
                                  return
                                }
                                const slot = slots.find(s => s.slotId === selectedSlotId)
                                setSelectedSlot(slot)
                                setOpenPersonalInfoForm(true)
                              }}
                            >
                              Tiếp Tục
                            </Button>
                          </div>
                        )}
                      </>
                    ) : null
                  })()
                ) : (
                  <div className='text-gray-500 text-center'>Vui lòng chọn dịch vụ để đặt lịch</div>
                )}
              </div>
            </div>
          </div>
          {/* Form popup đặt dịch vụ */}
          <ServiceBookingForm
            open={openForm}
            onOpenChange={setOpenForm}
            serviceId={selectedServiceId}
            onSuccess={() => {}}
          />
          <PersonalInfoForm
            open={openPersonalInfoForm}
            onOpenChange={setOpenPersonalInfoForm}
            selectedService={services.find(s => s.serviceId === selectedServiceId)}
            selectedSlot={selectedSlot}
            onSuccess={() => {
              setSelectedSlotId(null)
              setSelectedSlot(null)
            }}
            onSlotUpdate={fetchSlots}
          />
        </div>
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
