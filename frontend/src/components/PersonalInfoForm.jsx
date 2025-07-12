import React, { useState, useEffect } from 'react'
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
  const bookingId = useSelector((state) => state.user?.bookingId)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    gender: true
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'gender' ? value === 'true' : type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        phone: form.phone,
        gender: form.gender
      })

      toast.success('Đặt lịch thành công!')
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
                <span className='font-medium'>Ca:</span> {selectedSlot.shift}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='flex gap-2'>
            <div className='w-1/2'>
              <label className='block font-medium mb-1' htmlFor='lastName'>
                Họ
              </label>
              <Input
                id='lastName'
                name='lastName'
                value={form.lastName}
                onChange={handleChange}
                placeholder='Họ'
                required
              />
            </div>
            <div className='w-1/2'>
              <label className='block font-medium mb-1' htmlFor='firstName'>
                Tên
              </label>
              <Input
                id='firstName'
                name='firstName'
                value={form.firstName}
                onChange={handleChange}
                placeholder='Tên'
                required
              />
            </div>
          </div>

          <div>
            <label className='block font-medium mb-1' htmlFor='dateOfBirth'>
              Ngày tháng năm sinh
            </label>
            <Input
              id='dateOfBirth'
              name='dateOfBirth'
              type='date'
              value={form.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className='block font-medium mb-1' htmlFor='phone'>
              Số điện thoại
            </label>
            <Input
              id='phone'
              name='phone'
              value={form.phone}
              onChange={handleChange}
              placeholder='Số điện thoại'
              required
            />
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
