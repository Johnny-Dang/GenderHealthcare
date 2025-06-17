import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { Heart, AlertCircle } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
// import { DialogTrigger } from '@radix-ui/react-dialog'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const { login, loginWithGoogle, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const success = await login(email, password)

    if (success) {
      toast.success('Đăng nhập thành công: Chào mừng bạn quay trở lại!')

      const userData = JSON.parse(localStorage.getItem('wellcare_user') || '{}')

      switch (userData.role) {
        case 'admin':
          navigate('/admin/dashboard')
          break
        case 'staff':
          navigate('/staff/dashboard')
          break
        case 'consultant':
          navigate('/consultant/dashboard')
          break
        case 'manager':
          navigate('/manager/dashboard')
          break
        case 'user':
          navigate('/user/dashboard')
          break
        default:
          navigate('/')
      }
    } else {
      toast.error('Email hoặc mật khẩu không đúng')
      setError('Email hoặc mật khẩu không đúng')
    }
  }

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle()

    if (success) {
      toast.success('Đăng nhập Google thành công: Chào mừng bạn quay trở lại!')
      navigate('/')
    } else {
      toast.error('Đăng nhập Google thất bại')
      setError('Đăng nhập Google thất bại')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    console.log('Forgot password for:', forgotPasswordEmail)

    toast.success('Email khôi phục đã được gửi. Vui lòng kiểm tra email để đặt lại mật khẩu.')

    setIsForgotPasswordOpen(false)
    setForgotPasswordEmail('')
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
                  <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
                    <DialogTrigger asChild>
                      <button type='button' className='text-sm text-primary-500 hover:underline'>
                        Quên mật khẩu?
                      </button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-[400px]'>
                      <DialogHeader>
                        <DialogTitle>Khôi phục mật khẩu</DialogTitle>
                      </DialogHeader>
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

              <Button type='submit' className='w-full bg-gradient-primary' disabled={isLoading}>
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background px-2 text-muted-foreground'>Hoặc</span>
                </div>
              </div>

              <Button
                type='button'
                variant='outline'
                className='w-full'
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
                  <path
                    fill='currentColor'
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  />
                  <path
                    fill='currentColor'
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  />
                  <path
                    fill='currentColor'
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  />
                  <path
                    fill='currentColor'
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  />
                </svg>
                Đăng nhập với Google
              </Button>
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
