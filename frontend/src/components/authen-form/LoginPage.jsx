import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Heart, AlertCircle } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import GoogleLoginButton from '../GoogleLoginButton'
import { useDispatch } from 'react-redux'
import api from '../../configs/axios'
import { login } from '../../redux/features/userSlice'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [showResetForm, setShowResetForm] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/Account/login', {
        email,
        password
      })

      dispatch(login(response.data))
      localStorage.setItem('token', response.data.accessToken)

      if (response?.data?.accessToken && response?.data?.role) {
        toast.success('Đăng nhập thành công: Chào mừng bạn quay trở lại!')

        switch (response.data.role) {
          case 'Admin':
            navigate('/admin/dashboard')
            break
          case 'Staff':
            navigate('/staff/dashboard')
            break
          case 'Consultant':
            navigate('/consultant/schedule')
            break
          case 'Manager':
            navigate('/manager/dashboard')
            break
          case 'Customer':
            navigate('/')
            break
          default:
            navigate('/')
        }
      } else {
        toast.error('Dữ liệu phản hổi không hợp lệ')
        setError('Dữ liệu phản hổi không hợp lệ')
      }
    } catch (error) {
      const errorMessage = error.response?.data
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.post('/Account/forgot-password/send-code', {
        email: forgotPasswordEmail
      })
      toast.success('Email khôi phục đã được gửi. Vui lòng kiểm tra email để đặt lại mật khẩu.')
      setShowResetForm(true)
    } catch (error) {
      toast.error('Gửi email khôi phục thất bại. Vui lòng thử lại!')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.post('/Account/forgot-password/reset', {
        email: forgotPasswordEmail,
        verificationCode,
        newPassword
      })
      toast.success('Đặt lại mật khẩu thành công!')
      setShowResetForm(false)
      setIsForgotPasswordOpen(false)
      setForgotPasswordEmail('')
      setVerificationCode('')
      setNewPassword('')
    } catch (error) {
      toast.error('Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại mã xác thực hoặc thử lại!')
    }
  }

  return (
    <div className='min-h-screen bg-gradient-soft flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <Link to='/' className='flex items-center justify-center space-x-2 mb-4'>
            <div className='w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center'>
              <Heart className='h-6 w-6 text-white' />
            </div>
            <span className='text-2xl font-bold gradient-text'>WellCare</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>Đăng nhập vào tài khoản của bạn để tiếp tục</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder='Nhập email của bạn'
                />
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='password'>Mật khẩu</Label>
                  <Dialog
                    open={isForgotPasswordOpen}
                    onOpenChange={(open) => {
                      setIsForgotPasswordOpen(open)
                      if (!open) {
                        setShowResetForm(false)
                        setForgotPasswordEmail('')
                        setVerificationCode('')
                        setNewPassword('')
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <button type='button' className='text-sm text-primary-500 hover:underline'>
                        Quên mật khẩu?
                      </button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-[400px]'>
                      <DialogHeader>
                        <DialogTitle>Khôi phục mật khẩu</DialogTitle>
                      </DialogHeader>
                      {!showResetForm && (
                        <form onSubmit={handleForgotPassword} className='space-y-4'>
                          <div>
                            <Label htmlFor='forgotEmail'>Email khôi phục</Label>
                            <Input
                              id='forgotEmail'
                              type='email'
                              value={forgotPasswordEmail}
                              onChange={(e) => setForgotPasswordEmail(e.target.value)}
                              required
                              placeholder='Nhập email của bạn'
                            />
                          </div>
                          <Button type='submit' className='w-full bg-gradient-primary'>
                            Gửi email khôi phục
                          </Button>
                        </form>
                      )}
                      {showResetForm && (
                        <form onSubmit={handleResetPassword} className='space-y-4 mt-4'>
                          <div>
                            <Label htmlFor='verificationCode'>Mã xác thực</Label>
                            <Input
                              id='verificationCode'
                              type='text'
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              required
                              placeholder='Nhập mã xác thực'
                            />
                          </div>
                          <div>
                            <Label htmlFor='newPassword'>Mật khẩu mới</Label>
                            <Input
                              id='newPassword'
                              type='password'
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                              placeholder='Nhập mật khẩu mới'
                            />
                          </div>
                          <Button type='submit' className='w-full bg-gradient-primary'>
                            Đặt lại mật khẩu
                          </Button>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder='Nhập mật khẩu'
                />
              </div>

              {error && (
                <div className='flex items-center space-x-2 text-red-600 text-sm'>
                  <AlertCircle className='h-4 w-4' />
                  <span>{error}</span>
                </div>
              )}

              <Button type='submit' className='w-full bg-gradient-primary'>
                Đăng Nhập
              </Button>

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background px-2 text-muted-foreground'>Hoặc</span>
                </div>
              </div>

              <div className='flex justify-center items-center'>
                <GoogleLoginButton />
              </div>
            </form>

            <div className='mt-6 text-center text-sm'>
              <p className='text-gray-600'>
                Chưa có tài khoản?{' '}
                <Link to='/register' className='text-primary-500 hover:underline'>
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            {/* <div className='mt-4 p-3 bg-blue-50 rounded-md text-sm'>
              <p className='font-medium text-blue-800 mb-2'>Tài khoản demo:</p>
              <p className='text-blue-700'>Admin: admin@wellcare.com / admin123</p>
              <p className='text-blue-700'>Manager: manager@wellcare.com / manager123</p>
              <p className='text-blue-700'>Staff: staff@wellcare.com / staff123</p>
              <p className='text-blue-700'>Consultant: consultant@wellcare.com / consultant123</p>
              <p className='text-blue-700'>User: user@wellcare.com / user123</p>
            </div> */}
          </CardContent>
        </Card>
        <ToastContainer position='top-right' autoClose={3000} hideProgressBar={false} />
      </div>
    </div>
  )
}

export default Login
