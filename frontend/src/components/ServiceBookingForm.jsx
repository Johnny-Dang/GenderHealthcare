import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import axios from '@/configs/axios'
import { setBookingId, incrementCart } from '@/redux/features/userSlice'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'

export default function ServiceBookingForm({
  open,
  onOpenChange,
  serviceId,
  bookingDetail,
  onSuccess,
  slotId,
  onSlotUpdate
}) {
  const dispatch = useDispatch()
  const accountId = useSelector((state) => state.user.userInfo?.accountId)
  const bookingId = useSelector((state) => state.user.bookingId)
  const isEdit = !!bookingDetail

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    gender: true,
    slotDate: '',
    shift: ''
  })
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
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
      return 'Số điện thoại không hợp lệ '
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

  useEffect(() => {
    if (isEdit && bookingDetail) {
      setForm({
        firstName: bookingDetail.firstName || '',
        lastName: bookingDetail.lastName || '',
        dateOfBirth: bookingDetail.dateOfBirth ? new Date(bookingDetail.dateOfBirth).toISOString().split('T')[0] : '',
        phone: bookingDetail.phone || '',
        gender: bookingDetail.gender ?? true,
        slotDate: bookingDetail.slotDate ? new Date(bookingDetail.slotDate).toISOString().split('T')[0] : '',
        shift: bookingDetail.slotShift || ''
      })
    }
  }, [isEdit, bookingDetail])

  // Fetch available slots when slot date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (form.slotDate && isEdit && serviceId) {
        try {
          const response = await axios.get(`/api/TestServiceSlot/service/${serviceId}/date/${form.slotDate}`)
          setAvailableSlots(response.data || [])
        } catch (error) {
          console.error('Error fetching slots:', error)
          setAvailableSlots([])
        }
      } else {
        setAvailableSlots([])
      }
    }
    fetchSlots()
  }, [form.slotDate, isEdit, serviceId])

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

      if (cleanValue.length > 10) {
        return
      }
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
      if (isEdit) {
        const updateData = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          dateOfBirth: form.dateOfBirth,
          phone: form.phone.replace(/[\s\-()]/g, ''), // Clean phone number
          gender: form.gender,
          ...(form.slotDate ? { slotDate: form.slotDate } : {}),
          ...(form.shift ? { shift: form.shift } : {})
        }

        await axios.put(`/api/booking-details/${bookingDetail.bookingDetailId}`, updateData)
        toast.success('Cập nhật dịch vụ thành công!')
      } else {
        let currentBookingId = bookingId
        if (!currentBookingId) {
          const res = await axios.post('/api/bookings', { accountId })
          currentBookingId = res.data.bookingId
          dispatch(setBookingId(currentBookingId))
        }
        await axios.post('/api/booking-details', {
          bookingId: currentBookingId,
          serviceId,
          ...(slotId ? { slotId } : {}),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          dateOfBirth: form.dateOfBirth,
          phone: form.phone.replace(/[\s\-()]/g, ''), // Clean phone number
          gender: form.gender
        })
        toast.success('Thêm vào giỏ hàng thành công!')
        dispatch(incrementCart())
      }

      if (onSlotUpdate) {
        onSlotUpdate()
      }

      if (onSuccess) onSuccess()
      onOpenChange(false)

      // Reset form and errors
      if (!isEdit) {
        setForm({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          phone: '',
          gender: true,
          slotDate: '',
          shift: ''
        })
        setErrors({})
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa dịch vụ' : 'Đặt dịch vụ'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Cập nhật thông tin cho dịch vụ' : 'Vui lòng nhập thông tin để đặt dịch vụ'}
          </DialogDescription>
        </DialogHeader>
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
              maxLength={10}
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

          {/* Chỉ hiển thị các trường ngày đặt và ca đặt khi đang chỉnh sửa */}
          {isEdit && (
            <>
              <div>
                <label className='block font-medium mb-1' htmlFor='slotDate'>
                  Ngày đặt lịch
                </label>
                <Input
                  id='slotDate'
                  name='slotDate'
                  type='date'
                  value={form.slotDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {form.slotDate && (
                <div>
                  <label className='block font-medium mb-1' htmlFor='shift'>
                    Ca đặt lịch
                  </label>
                  <select
                    id='shift'
                    name='shift'
                    value={form.shift || ''}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value=''>Chọn ca đặt lịch</option>
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <option key={slot.slotId} value={slot.shift}>
                          {slot.shift === 'AM' ? 'Sáng (7h30 - 12h)' : 'Chiều (13h30 - 17h30)'}
                          {slot.maxBookings && ` - Còn ${slot.maxBookings - slot.currentBookings} chỗ`}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value='AM'>Sáng (7h30 - 12h)</option>
                        <option value='PM'>Chiều (13h30 - 17h30)</option>
                      </>
                    )}
                  </select>
                </div>
              )}
            </>
          )}
          <DialogFooter>
            <Button type='submit' className='w-full' disabled={loading}>
              {loading ? 'Đang xử lý...' : isEdit ? 'Lưu Thay Đổi' : 'Thêm Vào Giỏ Hàng'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
