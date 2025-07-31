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
    setForm((prev) => ({
      ...prev,
      [name]: name === 'gender' ? value === 'true' : type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit) {
        const updateData = {
          firstName: form.firstName,
          lastName: form.lastName,
          dateOfBirth: form.dateOfBirth,
          phone: form.phone,
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
          ...form
        })
        toast.success('Thêm vào giỏ hàng thành công!')
        dispatch(incrementCart())
      }

      if (onSlotUpdate) {
        onSlotUpdate()
      }

      if (onSuccess) onSuccess()
      onOpenChange(false)
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
