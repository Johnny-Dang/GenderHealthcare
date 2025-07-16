import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Heart, AlertCircle, ArrowRight, CheckCircle2, Mail } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import api from '../../configs/axios'

const Register = () => {
  const { showSuccess, showError } = useToast()
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

  // Step handling
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2

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

  const validateStep1 = () => {
    const newErrors = {}

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
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

  const validateStep2 = () => {
    const newErrors = {}

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

    // Verification code
    if (!verificationCode) {
      newErrors.verificationCode = 'Vui lòng nhập mã xác thực'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
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
      showError('Vui lòng nhập email trước khi gửi mã.')
      return
    }
    try {
      setIsLoading(true)
      await api.post('/Account/send-verification-code', { email: formData.email })
      showSuccess('Mã xác thực đã được gửi đến email của bạn.')
      setIsCodeSent(true)
      setIsCounting(true)
    } catch (error) {
      showError('Gửi mã xác thực thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (currentStep === 1) {
      handleNextStep()
      return
    }

    if (!validateStep2()) return
    if (!isCodeSent) {
      showError('Vui lòng gửi và nhập mã xác thực.')
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
        avatarUrl: '',
        dateOfBirth: formData.dateOfBirth,
        gender: genderBoolean,
        verificationCode: verificationCode
      })
      showSuccess('Đăng ký thành công!')
      navigate('/login')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      showError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='flex flex-col items-center mb-6'>
          <Link to='/' className='inline-block'>
            <div className='flex flex-col items-center'>
              <div className='w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mb-2 shadow-lg'>
                <Heart className='h-8 w-8 text-white' />
              </div>
              <span className='text-2xl font-bold gradient-text'>WellCare</span>
            </div>
          </Link>
        </div>

        <Card className='border-0 shadow-lg'>
          <CardHeader className='pb-4 border-b border-gray-100'>
            <div className='flex justify-between items-center mb-2'>
              <CardTitle className='text-xl font-semibold'>Đăng ký tài khoản</CardTitle>
              <div className='flex items-center gap-1 text-xs text-primary-500 font-medium'>
                <span
                  className={`rounded-full h-6 w-6 flex items-center justify-center ${currentStep === 1 ? 'bg-primary-500 text-white' : 'bg-primary-100'}`}
                >
                  1
                </span>
                <span className='text-gray-300'>/</span>
                <span
                  className={`rounded-full h-6 w-6 flex items-center justify-center ${currentStep === 2 ? 'bg-primary-500 text-white' : 'bg-primary-100'}`}
                >
                  2
                </span>
              </div>
            </div>
            <CardDescription>
              {currentStep === 1 ? 'Nhập thông tin cá nhân của bạn để bắt đầu' : 'Cài đặt mật khẩu và xác thực email'}
            </CardDescription>
          </CardHeader>

          <CardContent className='pt-6'>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {currentStep === 1 ? (
                /* Step 1: Personal Information */
                <>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='firstName' className='text-gray-700 font-medium'>
                        Tên <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='firstName'
                        type='text'
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder='Nhập tên'
                        className={`focus:ring-primary-300 ${errors.firstName ? 'border-red-300' : ''}`}
                      />
                      {errors.firstName && (
                        <div className='flex items-center gap-1 text-red-600 text-xs'>
                          <AlertCircle className='h-3 w-3' />
                          <span>{errors.firstName}</span>
                        </div>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='lastName' className='text-gray-700 font-medium'>
                        Họ <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='lastName'
                        type='text'
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder='Nhập họ'
                        className={`focus:ring-primary-300 ${errors.lastName ? 'border-red-300' : ''}`}
                      />
                      {errors.lastName && (
                        <div className='flex items-center gap-1 text-red-600 text-xs'>
                          <AlertCircle className='h-3 w-3' />
                          <span>{errors.lastName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='email' className='text-gray-700 font-medium'>
                      Email <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='email'
                      type='email'
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder='email@example.com'
                      className={`focus:ring-primary-300 ${errors.email ? 'border-red-300' : ''}`}
                    />
                    {errors.email && (
                      <div className='flex items-center gap-1 text-red-600 text-xs'>
                        <AlertCircle className='h-3 w-3' />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='phone' className='text-gray-700 font-medium'>
                      Số điện thoại <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='phone'
                      type='tel'
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder='0912345678'
                      className={`focus:ring-primary-300 ${errors.phone ? 'border-red-300' : ''}`}
                    />
                    {errors.phone && (
                      <div className='flex items-center gap-1 text-red-600 text-xs'>
                        <AlertCircle className='h-3 w-3' />
                        <span>{errors.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='dateOfBirth' className='text-gray-700 font-medium'>
                      Ngày sinh <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='dateOfBirth'
                      type='date'
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={`focus:ring-primary-300 ${errors.dateOfBirth ? 'border-red-300' : ''}`}
                    />
                    {errors.dateOfBirth && (
                      <div className='flex items-center gap-1 text-red-600 text-xs'>
                        <AlertCircle className='h-3 w-3' />
                        <span>{errors.dateOfBirth}</span>
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='gender' className='text-gray-700 font-medium'>
                      Giới tính <span className='text-red-500'>*</span>
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className={`focus:ring-primary-300 ${errors.gender ? 'border-red-300' : ''}`}>
                        <SelectValue placeholder='Chọn giới tính' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='male'>Nam</SelectItem>
                        <SelectItem value='female'>Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <div className='flex items-center gap-1 text-red-600 text-xs'>
                        <AlertCircle className='h-3 w-3' />
                        <span>{errors.gender}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type='button'
                    onClick={handleNextStep}
                    className='w-full mt-2 bg-gradient-primary hover:opacity-90'
                    variant='default'
                  >
                    Tiếp tục
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                </>
              ) : (
                /* Step 2: Password and Verification */
                <>
                  {/* Email verification section - Improved */}
                  <div className='bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 border border-primary-100 mb-4'>
                    <div className='mb-3'>
                      <h4 className='text-sm font-semibold text-gray-800 flex items-center gap-2 mb-1'>
                        <Mail className='text-primary-500 h-5 w-5' />
                        Xác thực email
                      </h4>
                      <p className='text-xs text-gray-600'>
                        Để hoàn tất đăng ký, chúng tôi cần xác thực email của bạn.
                      </p>
                    </div>

                    <div className='bg-white rounded-md p-3 border border-primary-100'>
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium text-gray-700'>{formData.email}</span>
                          {isCodeSent && (
                            <span className='bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full'>
                              Đã gửi mã
                            </span>
                          )}
                        </div>

                        <Button
                          type='button'
                          onClick={handleSendCode}
                          disabled={isCounting || isLoading}
                          className='bg-primary-600 text-white hover:bg-primary-700 text-xs h-8 px-3'
                          variant='default'
                          size='sm'
                        >
                          {isCounting ? (
                            <span className='flex items-center gap-1'>
                              <span className='inline-block h-3 w-3 rounded-full border-2 border-t-transparent border-white animate-spin'></span>
                              {countdown}s
                            </span>
                          ) : isCodeSent ? (
                            'Gửi lại mã'
                          ) : (
                            'Gửi mã xác thực'
                          )}
                        </Button>
                      </div>

                      {isCodeSent ? (
                        <>
                          <div className='flex flex-col space-y-2'>
                            <Label htmlFor='verificationCode' className='text-gray-700 text-xs font-medium'>
                              Mã xác thực <span className='text-red-500'>*</span>
                            </Label>

                            <div className='relative'>
                              <Input
                                id='verificationCode'
                                type='text'
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder='Nhập mã 6 chữ số'
                                className={`focus:ring-primary-300 ${errors.verificationCode ? 'border-red-300' : ''} text-center text-lg tracking-wider h-10`}
                                maxLength={6}
                              />
                              {verificationCode && (
                                <div className='absolute right-2 top-1/2 transform -translate-y-1/2'>
                                  <CheckCircle2
                                    className={`h-5 w-5 ${verificationCode.length === 6 ? 'text-primary-500' : 'text-gray-300'}`}
                                  />
                                </div>
                              )}
                            </div>

                            {errors.verificationCode && (
                              <div className='flex items-center gap-1 text-red-600 text-xs'>
                                <AlertCircle className='h-3 w-3' />
                                <span>{errors.verificationCode}</span>
                              </div>
                            )}

                            <p className='text-xs text-gray-500 mt-1'>
                              Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến (và thư rác). Mã
                              có hiệu lực trong 5 phút.
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className='text-xs text-gray-500 italic'>
                          Nhấn nút "Gửi mã xác thực" để nhận mã qua email
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password section */}
                  <div className='space-y-2'>
                    <Label htmlFor='password' className='text-gray-700 font-medium'>
                      Mật khẩu <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='password'
                      type='password'
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder='Nhập mật khẩu (ít nhất 6 ký tự)'
                      className={`focus:ring-primary-300 ${errors.password ? 'border-red-300' : ''}`}
                    />
                    {errors.password && (
                      <div className='flex items-center gap-1 text-red-600 text-xs'>
                        <AlertCircle className='h-3 w-3' />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword' className='text-gray-700 font-medium'>
                      Xác nhận mật khẩu <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='confirmPassword'
                      type='password'
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder='Nhập lại mật khẩu'
                      className={`focus:ring-primary-300 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                    />
                    {errors.confirmPassword && (
                      <div className='flex items-center gap-1 text-red-600 text-xs'>
                        <AlertCircle className='h-3 w-3' />
                        <span>{errors.confirmPassword}</span>
                      </div>
                    )}
                  </div>

                  <div className='flex gap-3 mt-6'>
                    <Button
                      type='button'
                      onClick={handlePrevStep}
                      className='flex-1 bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300'
                      variant='outline'
                    >
                      Quay lại
                    </Button>
                    <Button type='submit' className='flex-1 bg-gradient-primary hover:opacity-90' disabled={isLoading}>
                      {isLoading ? 'Đang đăng ký...' : 'Hoàn tất đăng ký'}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className='mt-6 text-center text-sm'>
              <p className='text-gray-600'>
                Đã có tài khoản?{' '}
                <Link to='/login' className='text-primary-600 hover:text-primary-700 font-medium hover:underline'>
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
