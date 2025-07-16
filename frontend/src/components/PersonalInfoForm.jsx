import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import axios from '@/configs/axios'
import { setBookingId, incrementCart } from '@/redux/features/userSlice'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'

export default function PersonalInfoForm({
  open,
  onOpenChange,
  selectedService,
  selectedSlot,
  onSuccess,
  onSlotUpdate
}) {
  const dispatch = useDispatch()
  const accountId = useSelector((state) => state.user?.userInfo?.accountId)
  const bookingId = useSelector((state) => state.user?.bookingId || '')

  // Kiểm tra user đã đăng nhập
  const userInfo = useSelector((state) => state.user?.userInfo || {})
  if (!userInfo?.accountId || !userInfo?.role) {
    return null
  }

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    gender: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Validation functions
  const validateName = (name, fieldName) => {
    if (!name.trim()) {
      return `${fieldName} không được để trống`
    }
    if (name.trim().length < 2) {
      return `${fieldName} phải có ít nhất 2 ký tự`
    }
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(name.trim())) {
      return `${fieldName} chỉ được chứa chữ cái và khoảng trắng`
    }
    return ''
  }

  const validatePhone = (phone) => {
    if (!phone.trim()) {
      return 'Số điện thoại không được để trống'
    }
    const cleanPhone = phone.replace(/[\s\-()]/g, '')
    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(cleanPhone)) {
      return 'Số điện thoại không hợp lệ (VD: 0912345678)'
    }
    return ''
  }

  const validateDateOfBirth = (dateOfBirth) => {
    if (!dateOfBirth) {
      return 'Ngày sinh không được để trống'
    }
    const selectedDate = new Date(dateOfBirth)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate >= today) {
      return 'Ngày sinh phải trước ngày hiện tại'
    }

    const age = today.getFullYear() - selectedDate.getFullYear()
    if (age > 150) {
      return 'Ngày sinh không hợp lệ'
    }

    return ''
  }

  const validateForm = () => {
    const newErrors = {}

    const lastNameError = validateName(form.lastName, 'Họ')
    if (lastNameError) newErrors.lastName = lastNameError

    const firstNameError = validateName(form.firstName, 'Tên')
    if (firstNameError) newErrors.firstName = firstNameError

    const phoneError = validatePhone(form.phone)
    if (phoneError) newErrors.phone = phoneError

    const dobError = validateDateOfBirth(form.dateOfBirth)
    if (dobError) newErrors.dateOfBirth = dobError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = name === 'gender' ? value === 'true' : type === 'checkbox' ? checked : value

    setForm((prev) => ({
      ...prev,
      [name]: newValue
    }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }

    // Real-time validation for phone number formatting
    if (name === 'phone' && value) {
      // Only allow numbers and some formatting characters
      const cleanValue = value.replace(/[^\d\s\-()]/g, '')
      if (cleanValue !== value) {
        setForm((prev) => ({
          ...prev,
          [name]: cleanValue
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form before submitting
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Tạo booking mới nếu chưa có
      let currentBookingId = bookingId
      if (!currentBookingId) {
        const res = await axios.post('/api/bookings', { accountId })
        currentBookingId = res.data.bookingId
        dispatch(setBookingId(currentBookingId))
      }

      // Gửi thông tin đặt lịch
      await axios.post('/api/booking-details', {
        bookingId: currentBookingId,
        serviceId: selectedService.serviceId,
        slotDate: selectedSlot.slotDate,
        shift: selectedSlot.shift,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth,
        phone: form.phone.replace(/[\s\-()]/g, ''), // Clean phone number
        gender: form.gender
      })

      toast.success('Đặt lịch thành công hãy kiểm tra giỏ hàng!')
      dispatch(incrementCart())

      // Gọi callback để cập nhật thông tin slot
      if (onSlotUpdate) {
        onSlotUpdate()
      }

      if (onSuccess) onSuccess()
      onOpenChange(false)

      // Reset form
      setForm({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        phone: '',
        gender: true
      })
      setErrors({})
    } catch (err) {
      console.error('Lỗi đặt lịch:', err)
      toast.error('Đặt lịch thất bại! Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Thông tin cá nhân</DialogTitle>
          <DialogDescription>Vui lòng nhập thông tin cá nhân để hoàn tất đặt lịch</DialogDescription>
        </DialogHeader>

        {selectedService && selectedSlot && (
          <div className='mb-4 p-3 bg-gray-50 rounded-lg'>
            <h4 className='font-semibold text-sm mb-2'>Thông tin đặt lịch:</h4>
            <div className='text-sm space-y-1'>
              <div>
                <span className='font-medium'>Dịch vụ:</span> {selectedService.serviceName}
              </div>
              <div>
                <span className='font-medium'>Ngày:</span> {selectedSlot.slotDate}
              </div>
              <div>
                <span className='font-medium'>Ca:</span>{' '}
                {selectedSlot.shift === 'AM'
                  ? 'Sáng (7h30 - 12h)'
                  : selectedSlot.shift === 'PM'
                    ? 'Tối (13h30 - 17h30)'
                    : selectedSlot.shift}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='flex gap-2'>
            <div className='w-1/2'>
              <label className='block font-medium mb-1' htmlFor='lastName'>
                Họ <span className='text-red-500'>*</span>
              </label>
              <Input
                id='lastName'
                name='lastName'
                value={form.lastName}
                onChange={handleChange}
                placeholder='Họ'
                required
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && <p className='text-red-500 text-xs mt-1'>{errors.lastName}</p>}
            </div>
            <div className='w-1/2'>
              <label className='block font-medium mb-1' htmlFor='firstName'>
                Tên <span className='text-red-500'>*</span>
              </label>
              <Input
                id='firstName'
                name='firstName'
                value={form.firstName}
                onChange={handleChange}
                placeholder='Tên'
                required
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && <p className='text-red-500 text-xs mt-1'>{errors.firstName}</p>}
            </div>
          </div>

          <div>
            <label className='block font-medium mb-1' htmlFor='dateOfBirth'>
              Ngày tháng năm sinh <span className='text-red-500'>*</span>
            </label>
            <Input
              id='dateOfBirth'
              name='dateOfBirth'
              type='date'
              value={form.dateOfBirth}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]} // Không cho chọn ngày tương lai
              className={errors.dateOfBirth ? 'border-red-500' : ''}
            />
            {errors.dateOfBirth && <p className='text-red-500 text-xs mt-1'>{errors.dateOfBirth}</p>}
          </div>

          <div>
            <label className='block font-medium mb-1' htmlFor='phone'>
              Số điện thoại <span className='text-red-500'>*</span>
            </label>
            <Input
              id='phone'
              name='phone'
              value={form.phone}
              onChange={handleChange}
              placeholder='Số điện thoại'
              required
              maxLength={15}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className='text-red-500 text-xs mt-1'>{errors.phone}</p>}
          </div>

          <div className='flex items-center gap-4'>
            <label className='font-medium'>Giới tính:</label>
            <label className='flex items-center gap-1'>
              <input
                type='radio'
                name='gender'
                value={true}
                checked={form.gender === true}
                onChange={handleChange}
                required
              />
              Nam
            </label>
            <label className='flex items-center gap-1'>
              <input
                type='radio'
                name='gender'
                value={false}
                checked={form.gender === false}
                onChange={handleChange}
                required
              />
              Nữ
            </label>
          </div>

          <DialogFooter>
            <Button type='submit' className='w-full' disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Hoàn tất đặt lịch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
