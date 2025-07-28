import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MessageSquare } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useToast } from '@/hooks/useToast'
import api from '@/configs/axios'

const ConsultantBookingDialog = ({ isOpen, onOpenChange, consultant, onBookingSuccess }) => {
  const userInfo = useSelector((state) => state.user?.userInfo || {})
  const { showSuccess } = useToast()

  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    staffId: '',
    scheduledDate: '',
    scheduledTime: '',
    message: ''
  })

  const [formErrors, setFormErrors] = useState({})
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    if (userInfo?.accountId && userInfo?.role) {
      setFormData((prevData) => ({
        ...prevData,
        guestName: userInfo.fullName || '',
        guestEmail: userInfo.email || '',
        guestPhone: ''
      }))
    } else {
      setFormData((prevData) => ({
        ...prevData,
        guestName: '',
        guestEmail: '',
        guestPhone: ''
      }))
    }
  }, [userInfo])

  const getInitialAvatar = (name) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  const validateForm = () => {
    const errors = {}

    if (!userInfo?.accountId || !userInfo?.role) {
      if (!formData.guestName.trim()) {
        errors.guestName = 'Họ tên không được để trống'
      }
      if (!formData.guestEmail.trim()) {
        errors.guestEmail = 'Email không được để trống'
      } else if (!/\S+@\S+\.\S+/.test(formData.guestEmail)) {
        errors.guestEmail = 'Email không đúng định dạng'
      }
      if (!formData.guestPhone.trim()) {
        errors.guestPhone = 'Số điện thoại không được để trống'
      } else if (!/^[0-9]{10,11}$/.test(formData.guestPhone.replace(/\s/g, ''))) {
        errors.guestPhone = 'Số điện thoại phải có 10-11 chữ số'
      }
    }

    if (!formData.scheduledDate) {
      errors.scheduledDate = 'Vui lòng chọn ngày'
    } else {
      const selectedDate = new Date(formData.scheduledDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        errors.scheduledDate = 'Không thể chọn ngày trong quá khứ'
      }
    }

    if (!formData.scheduledTime) {
      errors.scheduledTime = 'Vui lòng chọn giờ'
    } else {
      const [hours] = formData.scheduledTime.split(':').map(Number)

      if (hours < 8 || hours >= 17) {
        errors.scheduledTime = 'Giờ làm việc từ 8:00 - 17:00'
      }

      if (formData.scheduledDate) {
        const now = new Date()
        const selectedDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`)
        const timeDiffInHours = (selectedDateTime - now) / (1000 * 60 * 60)

        if (timeDiffInHours < 2) {
          errors.scheduledTime = 'Vui lòng chọn thời gian ít nhất 2 tiếng sau thời điểm hiện tại'
        }
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target

    setFormErrors({
      ...formErrors,
      [name]: undefined
    })

    setApiError('')

    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    if (!validateForm()) {
      return
    }

    if (!consultant) {
      setApiError('Vui lòng chọn tư vấn viên!')
      return
    }

    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`)

    try {
      const payload = {
        customerId: userInfo?.accountId && userInfo?.role ? userInfo.accountId : null,
        guestName: !userInfo?.accountId || !userInfo?.role ? formData.guestName : null,
        guestEmail: !userInfo?.accountId || !userInfo?.role ? formData.guestEmail : null,
        guestPhone: !userInfo?.accountId || !userInfo?.role ? formData.guestPhone : null,
        staffId: consultant.id,
        scheduledAt: scheduledDateTime.toISOString(),
        message: formData.message
      }

      await api.post('/api/ConsultationBooking/book', payload)

      onOpenChange(false)

      showSuccess('Đặt lịch thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.')

      setFormData({
        guestName: userInfo?.fullName || '',
        guestEmail: userInfo?.email || '',
        guestPhone: '',
        staffId: '',
        scheduledDate: '',
        scheduledTime: '',
        message: ''
      })
      setFormErrors({})
      setApiError('')

      if (onBookingSuccess) {
        onBookingSuccess()
      }
    } catch (error) {
      console.error('Booking error:', error)

      if (error.response?.data?.message) {
        setApiError(error.response.data.message)
      } else if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors
        const newErrors = {}

        Object.keys(serverErrors).forEach((key) => {
          if (serverErrors[key] && serverErrors[key].length > 0) {
            const fieldName = key.charAt(0).toLowerCase() + key.slice(1)
            newErrors[fieldName] = serverErrors[key][0]
          }
        })

        setFormErrors(newErrors)
        setApiError('Đã có lỗi khi đặt lịch. Vui lòng kiểm tra lại thông tin.')
      } else {
        setApiError('Đã xảy ra lỗi khi đặt lịch. Vui lòng thử lại sau.')
      }
    }
  }

  if (!consultant) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md bg-white'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-primary-600 text-center w-full justify-center mb-2'>
            <Calendar className='w-5 h-5' />
            <span>Đặt lịch với {consultant.fullName}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleBookingSubmit} className='mt-4 space-y-4'>
          {apiError && (
            <div className='bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm'>
              <p className='font-medium'>Lỗi:</p>
              <p>{apiError}</p>
            </div>
          )}

          <div className='bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-lg flex flex-col items-center text-center'>
            {consultant.avatarUrl ? (
              <img
                src={consultant.avatarUrl}
                alt={consultant.fullName}
                className='h-16 w-16 rounded-full object-cover border-2 border-white shadow mb-2'
              />
            ) : (
              <div className='h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl mb-2'>
                {getInitialAvatar(consultant.fullName)}
              </div>
            )}
            <div>
              <h4 className='font-medium text-gray-900'>{consultant.fullName}</h4>
              <p className='text-sm text-primary-600'>{consultant.department || 'Chuyên gia tư vấn'}</p>
            </div>
          </div>

          {!userInfo?.accountId || !userInfo?.role ? (
            <div className='space-y-3 border border-gray-200 rounded-lg p-4'>
              <h4 className='font-medium text-sm text-gray-700'>Thông tin cá nhân</h4>
              <div className='grid grid-cols-1 gap-3'>
                <div className='space-y-1'>
                  <label className='text-xs font-medium text-gray-700'>
                    Họ và tên <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='guestName'
                    value={formData.guestName}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      formErrors.guestName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.guestName && <p className='text-red-600 text-xs mt-1'>{formErrors.guestName}</p>}
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <label className='text-xs font-medium text-gray-700'>
                      Email <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='email'
                      name='guestEmail'
                      value={formData.guestEmail}
                      onChange={handleFormChange}
                      required
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        formErrors.guestEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.guestEmail && <p className='text-red-600 text-xs mt-1'>{formErrors.guestEmail}</p>}
                  </div>
                  <div className='space-y-1'>
                    <label className='text-xs font-medium text-gray-700'>
                      Số điện thoại <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='tel'
                      name='guestPhone'
                      value={formData.guestPhone}
                      onChange={handleFormChange}
                      required
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        formErrors.guestPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.guestPhone && <p className='text-red-600 text-xs mt-1'>{formErrors.guestPhone}</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='bg-primary-50 border border-primary-100 p-3 rounded-lg'>
              <div className='flex items-center gap-3'>
                <div className='h-10 w-10 flex items-center justify-center rounded-full overflow-hidden bg-primary-100'>
                  {userInfo.avatarUrl ? (
                    <img src={userInfo.avatarUrl} alt={userInfo.fullName} className='h-full w-full object-cover' />
                  ) : (
                    <span className='text-sm font-medium text-primary-600'>{getInitialAvatar(userInfo.fullName)}</span>
                  )}
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-900'>{userInfo.fullName}</p>
                  <p className='text-xs text-gray-500'>{userInfo.email}</p>
                </div>
              </div>
            </div>
          )}

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <label className='text-xs font-medium text-gray-700 flex items-center gap-1'>
                <Calendar className='w-3.5 h-3.5' />
                Ngày tư vấn <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                name='scheduledDate'
                value={formData.scheduledDate}
                onChange={handleFormChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  formErrors.scheduledDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {formErrors.scheduledDate && <p className='text-red-600 text-xs mt-1'>{formErrors.scheduledDate}</p>}
            </div>
            <div className='space-y-1'>
              <label className='text-xs font-medium text-gray-700 flex items-center gap-1'>
                <Clock className='w-3.5 h-3.5' />
                Giờ tư vấn <span className='text-red-500'>*</span>
              </label>
              <select
                name='scheduledTime'
                value={formData.scheduledTime}
                onChange={handleFormChange}
                required
                className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  formErrors.scheduledTime ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value=''>Chọn giờ (8:00 - 17:00)</option>
                <option value='08:00'>08:00</option>
                <option value='09:00'>09:00</option>
                <option value='10:00'>10:00</option>
                <option value='11:00'>11:00</option>
                <option value='12:00'>12:00</option>
                <option value='13:00'>13:00</option>
                <option value='14:00'>14:00</option>
                <option value='15:00'>15:00</option>
                <option value='16:00'>16:00</option>
              </select>
              {formErrors.scheduledTime && <p className='text-red-600 text-xs mt-1'>{formErrors.scheduledTime}</p>}
            </div>
          </div>

          <div className='space-y-1'>
            <label className='text-xs font-medium text-gray-700 flex items-center gap-1'>
              <MessageSquare className='w-3.5 h-3.5' />
              Nội dung cần tư vấn
            </label>
            <textarea
              name='message'
              value={formData.message}
              onChange={handleFormChange}
              rows={3}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
              placeholder='Mô tả vấn đề bạn cần tư vấn...'
            ></textarea>
          </div>

          <Button type='submit' className='w-full bg-gradient-primary hover:opacity-90 text-white font-medium shadow'>
            Xác nhận đặt lịch
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ConsultantBookingDialog
