import React, { useEffect, useState, useCallback } from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Phone, Shield, Heart, CheckCircle, X } from 'lucide-react'
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
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const [bookingDate, setBookingDate] = useState(tomorrow.toISOString().split('T')[0])
  const [slots, setSlots] = useState(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlotId, setSelectedSlotId] = useState(null)
  const [openPersonalInfoForm, setOpenPersonalInfoForm] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [selectedServiceDetail, setSelectedServiceDetail] = useState(null)
  const [dateError, setDateError] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const navigate = useNavigate()
  const accountId = useSelector((state) => state.user?.userInfo?.accountId)

  // Validation cho ngày đặt lịch
  const validateBookingDate = (date) => {
    if (!date) {
      return 'Vui lòng chọn ngày đặt lịch'
    }

    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate <= today) {
      return 'Ngày đặt lịch phải sau ngày hiện tại ít nhất 1 ngày'
    }

    return ''
  }

  // Handle thay đổi ngày đặt lịch
  const handleBookingDateChange = (e) => {
    const newDate = e.target.value
    setBookingDate(newDate)

    // Validate ngay khi thay đổi
    const error = validateBookingDate(newDate)
    setDateError(error)

    // Reset selected slot khi đổi ngày
    setSelectedSlotId(null)
    setSelectedSlot(null)
  }

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      try {
        const response = await axios.get('/api/services')
        const servicesData = response.data
        setServices(servicesData)

        // Extract unique categories from services
        const uniqueCategories = [...new Set(servicesData.map((service) => service.category).filter(Boolean))]
        setCategories(['Tất cả', ...uniqueCategories])
      } catch (error) {
        console.error('Lỗi khi lấy danh mục dịch vụ:', error)
        setServices([])
        setCategories(['Tất cả'])
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  // Gọi API lấy slot khi chọn dịch vụ hoặc đổi ngày
  const fetchSlots = useCallback(async () => {
    if (selectedServiceId && bookingDate) {
      // Kiểm tra validation ngày trước khi gọi API
      const dateValidationError = validateBookingDate(bookingDate)
      if (dateValidationError) {
        setSlots(null)
        return
      }

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
  }, [selectedServiceId, bookingDate, navigate])

  useEffect(() => {
    fetchSlots()
  }, [selectedServiceId, bookingDate, fetchSlots])

  // Lọc dịch vụ theo category chứa chuỗi nhập vào
  const filteredServices = services.filter((service) => {
    if (categoryInput.trim() !== '') {
      return service.category?.toLowerCase().includes(categoryInput.trim().toLowerCase())
    }
    if (selectedCategory && selectedCategory !== 'Tất cả') {
      return service.category === selectedCategory
    }
    return true
  })

  // Hàm mở modal chi tiết
  const openServiceDetail = (service) => {
    setSelectedServiceDetail(service)
    setOpenDetailModal(true)
  }

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
            {categories.map((category) => {
              const count =
                category === 'Tất cả'
                  ? services.length
                  : services.filter((service) => service.category === category).length

              return (
                <Button
                  key={category}
                  variant={category === selectedCategory ? 'default' : 'outline'}
                  className={`rounded-full px-5 py-2 shadow-sm transition-all duration-200 ${category === selectedCategory ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-pink-50'}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} ({count})
                </Button>
              )
            })}
          </div>
          <div className='flex gap-2'>
            <input
              type='text'
              className='border border-gray-200 rounded-full px-4 py-2 min-w-[200px] focus:ring-2 focus:ring-pink-400 outline-none shadow-sm'
              placeholder='Nhập tên danh mục...'
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSelectedCategory('')
                  // Optionally trigger search
                }
              }}
            />
            <Button
              className='rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white px-5 py-2 shadow-sm hover:opacity-90'
              onClick={() => {
                setSelectedCategory('')
                setCategoryInput('')
              }}
            >
              Lọc
            </Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className='py-16 bg-gradient-to-b from-pink-50 to-white min-h-screen'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-10'>
            {/* Danh sách dịch vụ */}
            <div className='md:col-span-2'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8'>
                {loading ? (
                  <div className='col-span-full text-center py-10'>Đang tải...</div>
                ) : filteredServices.length === 0 ? (
                  <div className='col-span-full text-center py-10 text-gray-500'>
                    Không tìm thấy dịch vụ nào phù hợp
                  </div>
                ) : (
                  filteredServices.map((service) => (
                    <Card
                      key={service.serviceId}
                      className='flex flex-col border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl bg-white'
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
                        <p className='text-gray-600 mb-2 flex-1'>{service.title}</p>
                        <div className='flex items-center gap-2 text-sm text-gray-500 mb-2'>
                          <Clock className='w-4 h-4' />
                          <span>{service.createdAt ? new Date(service.createdAt).toLocaleDateString() : ''}</span>
                        </div>
                        <div className='text-2xl font-bold text-pink-600 mb-4'>
                          {service.price?.toLocaleString()} VNĐ
                        </div>
                        <div className='flex gap-2 mt-auto'>
                          <Button
                            variant='outline'
                            className='flex-1 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-full font-semibold shadow-sm'
                            onClick={() => openServiceDetail(service)}
                          >
                            Xem chi tiết
                          </Button>
                          <Button
                            className='flex-1 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:opacity-90 text-white rounded-full font-semibold shadow-md'
                            onClick={() => setSelectedServiceId(service.serviceId)}
                          >
                            Chọn dịch vụ
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
            {/* Form đặt lịch */}
            <div className='md:col-span-1'>
              <div
                className='bg-white rounded-2xl shadow-2xl p-8 border border-pink-100 max-h-[calc(100vh-4rem)] overflow-y-auto z-30'
                style={{
                  position: 'sticky',
                  top: '64px',
                  alignSelf: 'flex-start'
                }}
              >
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
                          <label className='block text-gray-700 mb-1 font-medium'>
                            Ngày đặt lịch <span className='text-red-500'>*</span>
                          </label>
                          <input
                            type='date'
                            className={`border rounded-full px-4 py-2 w-full focus:ring-2 focus:ring-pink-400 outline-none shadow-sm mb-1 ${
                              dateError ? 'border-red-500' : 'border-gray-200'
                            }`}
                            value={bookingDate}
                            onChange={handleBookingDateChange}
                            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Ngày mai
                          />
                          {dateError && <p className='text-red-500 text-xs mt-1'>{dateError}</p>}
                        </div>
                        {/* Hiển thị lỗi validation ngày */}
                        {dateError && !slots && !loadingSlots && (
                          <div className='text-red-500 text-center py-4 bg-red-50 rounded-lg mb-4'>{dateError}</div>
                        )}
                        {/* Hiển thị thông tin slot nếu có */}
                        {loadingSlots && <div className='text-gray-500'>Đang tải khung giờ...</div>}
                        {slots && (
                          <div className='mt-6 flex-1 overflow-y-auto'>
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
                                        <span className='font-semibold'>Ca:</span>{' '}
                                        {slot.shift === 'AM'
                                          ? 'Sáng (7h30 - 12h)'
                                          : slot.shift === 'PM'
                                            ? 'Tối (13h30 - 17h30)'
                                            : slot.shift}
                                      </div>
                                      <div>
                                        <span className='font-semibold'>Ngày:</span> {slot.slotDate}
                                      </div>
                                      <div>
                                        <span className='font-semibold'>Số lượng còn lại:</span>{' '}
                                        {slot.availableQuantity}
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
                          <div className='mt-6 pt-4 border-t border-gray-200'>
                            <Button
                              className='w-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white rounded-full font-semibold py-3 shadow-md hover:opacity-90 transition'
                              onClick={() => {
                                // Kiểm tra validation ngày trước
                                const dateValidationError = validateBookingDate(bookingDate)
                                if (dateValidationError) {
                                  setDateError(dateValidationError)
                                  return
                                }

                                if (!accountId) {
                                  setShowLoginModal(true)
                                  return
                                }

                                const slot = slots.find((s) => s.slotId === selectedSlotId)
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
            selectedService={services.find((s) => s.serviceId === selectedServiceId)}
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
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>Tại sao nện đặt xét nghiệm với chúng tôi?</h2>
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

      {/* Modal Chi tiết dịch vụ */}
      {openDetailModal && selectedServiceDetail && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-start mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>Chi tiết dịch vụ</h2>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setOpenDetailModal(false)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <X className='w-5 h-5' />
                </Button>
              </div>

              <div className='space-y-6'>
                {/* Hình ảnh */}
                <div className='aspect-video overflow-hidden rounded-xl'>
                  <img
                    src={selectedServiceDetail.imageUrl || 'https://placehold.co/600x400?text=No+Image'}
                    alt={selectedServiceDetail.serviceName}
                    className='w-full h-full object-cover'
                  />
                </div>

                {/* Thông tin cơ bản */}
                <div className='space-y-4'>
                  <div>
                    <span className='text-sm bg-pink-100 text-pink-600 px-3 py-1 rounded-full font-medium'>
                      {selectedServiceDetail.category}
                    </span>
                  </div>

                  <div>
                    <h3 className='text-2xl font-bold text-gray-900 mb-2'>{selectedServiceDetail.serviceName}</h3>
                    <h4 className='text-lg font-semibold text-pink-600 mb-2'>{selectedServiceDetail.title}</h4>
                  </div>

                  <div>
                    <h5 className='font-semibold text-gray-700 mb-2'>Mô tả:</h5>
                    <p className='text-gray-600 leading-relaxed'>{selectedServiceDetail.description}</p>
                  </div>

                  <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
                    <div>
                      <span className='text-sm text-gray-500'>Giá dịch vụ:</span>
                      <div className='text-3xl font-bold text-pink-600'>
                        {selectedServiceDetail.price?.toLocaleString()} VNĐ
                      </div>
                    </div>
                    <Button
                      className='bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:opacity-90 text-white px-6 py-3 rounded-full font-semibold shadow-md'
                      onClick={() => {
                        setSelectedServiceId(selectedServiceDetail.serviceId)
                        setOpenDetailModal(false)
                      }}
                    >
                      Chọn dịch vụ này
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận đăng nhập */}
      {showLoginModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4'>
                <Heart className='w-5 h-5 text-white' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>Yêu cầu đăng nhập</h3>
              <p className='text-gray-600 mb-6'>
                Bạn cần đăng nhập trước khi sử dụng dịch vụ này. Vui lòng đăng nhập để tiếp tục.
              </p>
              <div className='flex gap-3 justify-center'>
                <Button variant='outline' onClick={() => setShowLoginModal(false)} className='px-6'>
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    setShowLoginModal(false)
                    navigate('/login')
                  }}
                  className='bg-primary-600 hover:bg-primary-700 text-white px-6'
                >
                  Đăng nhập
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default Services
