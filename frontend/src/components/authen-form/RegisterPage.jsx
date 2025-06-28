import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Heart, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../configs/axios'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: ''
  })
  const [errors, setErrors] = useState({})
  const [verificationCode, setVerificationCode] = useState('')
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(15)
  const [isCounting, setIsCounting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let timer
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (countdown === 0) {
      setIsCounting(false)
      setCountdown(15)
    }
    return () => clearTimeout(timer)
  }, [isCounting, countdown])

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Tên là bắt buộc'
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Họ là bắt buộc'
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/
    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại là bắt buộc'
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)'
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Ngày sinh là bắt buộc'
    } else {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 13) {
        newErrors.dateOfBirth = 'Bạn phải từ 13 tuổi trở lên'
      }
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Giới tính là bắt buộc'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSendCode = async () => {
    if (!formData.email) {
      toast.error('Vui lòng nhập email trước khi gửi mã.')
      return
    }
    try {
      await api.post('/Account/send-verification-code', { email: formData.email })
      toast.success('Mã xác thực đã được gửi đến email của bạn.')
      setIsCodeSent(true)
      setIsCounting(true)
    } catch (error) {
      toast.error('Gửi mã xác thực thất bại. Vui lòng thử lại.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    if (!isCodeSent) {
      toast.error('Vui lòng gửi và nhập mã xác thực.')
      return
    }
    setIsLoading(true)
    try {
      const genderBoolean = formData.gender === 'male'
      await api.post('/Account/register-with-code', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        avatarUrl: '', // or a default avatar URL
        dateOfBirth: formData.dateOfBirth,
        gender: genderBoolean,
        verificationCode: verificationCode
      })
      toast.success('Đăng ký thành công!')
      navigate('/login')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-soft flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='flex flex-col items-center mb-4'>
          <Link to='/' className='inline-block'>
            <div className='flex flex-col items-center'>
              <div className='w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mb-2'>
                <Heart className='h-8 w-8 text-white' />
              </div>
              <span className='text-xl font-bold gradient-text'>WellCare</span>
            </div>
          </Link>
        </div>
        <Card>
          <CardHeader className='text-center'>
            <CardTitle>Đăng ký</CardTitle>
            <CardDescription>Tạo tài khoản mới để bắt đầu chăm sóc sức khỏe</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>Tên *</Label>
                  <Input
                    id='firstName'
                    type='text'
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder='Nhập tên'
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <div className='flex items-center space-x-1 text-red-600 text-xs'>
                      <AlertCircle className='h-3 w-3' />
                      <span>{errors.firstName}</span>
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Họ *</Label>
                  <Input
                    id='lastName'
                    type='text'
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder='Nhập họ'
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <div className='flex items-center space-x-1 text-red-600 text-xs'>
                      <AlertCircle className='h-3 w-3' />
                      <span>{errors.lastName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder='Nhập email'
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={isCounting}
                />
                <Button type='button' onClick={handleSendCode} disabled={isCounting || !formData.email}>
                  {isCounting ? `Gửi lại sau (${countdown}s)` : isCodeSent ? 'Gửi lại mã' : 'Gửi mã'}
                </Button>
              </div>

              {isCodeSent && (
                <div className='space-y-2'>
                  <Label htmlFor='verificationCode'>Mã xác thực *</Label>
                  <Input
                    id='verificationCode'
                    type='text'
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder='Nhập mã từ email'
                    required
                  />
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='phone'>Số điện thoại *</Label>
                <Input
                  id='phone'
                  type='tel'
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder='Nhập số điện thoại'
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <div className='flex items-center space-x-1 text-red-600 text-xs'>
                    <AlertCircle className='h-3 w-3' />
                    <span>{errors.phone}</span>
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='dateOfBirth'>Ngày sinh *</Label>
                <Input
                  id='dateOfBirth'
                  type='date'
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={errors.dateOfBirth ? 'border-red-500' : ''}
                />
                {errors.dateOfBirth && (
                  <div className='flex items-center space-x-1 text-red-600 text-xs'>
                    <AlertCircle className='h-3 w-3' />
                    <span>{errors.dateOfBirth}</span>
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='gender'>Giới tính *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                    <SelectValue placeholder='Chọn giới tính' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='male'>Nam</SelectItem>
                    <SelectItem value='female'>Nữ</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <div className='flex items-center space-x-1 text-red-600 text-xs'>
                    <AlertCircle className='h-3 w-3' />
                    <span>{errors.gender}</span>
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Mật khẩu *</Label>
                <Input
                  id='password'
                  type='password'
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder='Nhập mật khẩu (ít nhất 6 ký tự)'
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <div className='flex items-center space-x-1 text-red-600 text-xs'>
                    <AlertCircle className='h-3 w-3' />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Xác nhận mật khẩu *</Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder='Nhập lại mật khẩu'
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <div className='flex items-center space-x-1 text-red-600 text-xs'>
                    <AlertCircle className='h-3 w-3' />
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
              </div>

              <Button type='submit' className='w-full bg-gradient-primary' disabled={isLoading}>
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
            </form>

            <div className='mt-6 text-center text-sm'>
              <p className='text-gray-600'>
                Đã có tài khoản?{' '}
                <Link to='/login' className='text-primary-500 hover:underline'>
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Register
