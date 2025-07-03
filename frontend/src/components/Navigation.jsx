import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, Dropdown } from 'antd'
import { Heart, Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '@/redux/features/userSlice'
import api from '@/configs/axios'
import { toast } from 'react-toastify'
import CartIcon from './CartIcon'
import NotificationBell from './NotificationBell'

const Navigation = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const userInfo = useSelector((state) => state.user?.userInfo)
  const dispatch = useDispatch()
  const isGuest = !userInfo

  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [{ path: '/', label: 'Trang chủ' }]

    if (isGuest) {
      return [
        ...baseItems,
        { path: '/test-service', label: 'Dịch vụ xét nghiệm' },
        { path: '/booking-consultant', label: 'Đặt tư vấn' }, // Thêm đường dẫn tư vấn cho khách
        { path: '/blog', label: 'Blog' },
        { path: '/cycle-tracking', label: 'Theo dõi chu kỳ' }
      ]
    }

    switch (userInfo.role) {
      case 'Admin':
        return [
          { path: '/admin', label: 'Quản lý hệ thống' },
          { path: '/admin/users', label: 'Quản lý tài khoản' }
        ]
      case 'Manager':
        return [
          { path: '/manager/dashboard', label: 'Bảng Điều Khiển' },
          { path: '/test-service', label: 'Dịch vụ xét nghiệm' }
        ]

      case 'Staff':
        return [
          { path: '/staff/dashboard', label: 'Bảng Điều Khiển' },
          { path: '/blog', label: 'Blog' }
        ]

      case 'Consultant':
        return [
          // { path: '/consultant-dashboard', label: 'Dashboard' },
          { path: '/consultant/schedule', label: 'Lịch tư vấn' },
          { path: '/consultant/test-results', label: 'Tra cứu kết quả' }
        ]

      case 'Customer':
        return [
          { path: '/customer-dashboard', label: 'Dashboard' },
          { path: '/test-service', label: 'Dịch vụ xét nghiệm' },
          { path: '/booking-consultant', label: 'Đặt tư vấn' },
          { path: '/blog', label: 'Blog' },
          { path: '/cycle-tracking', label: 'Theo dõi chu kỳ' }
        ]
      default:
        return baseItems
    }
  }

  const navItems = getNavItems()

  const isActivePath = (path) => {
    return location.pathname === path
  }

  const handleLogout = async () => {
    try {
      // Thay đổi thứ tự: Phải gọi API TRƯỚC khi xóa token
      // Lấy token từ cả hai nguồn để đảm bảo có token
      const token = localStorage.getItem('token') || userInfo?.accessToken

      console.log('Token used for logout:', token?.substring(0, 20) + '...') // Debug token

      if (token) {
        // Thêm thêm headers và options cho request
        await api.post(
          '/Account/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        )
        console.log('Logout API called successfully')
      } else {
        console.warn('No token available for logout')
      }
    } catch (error) {
      console.error('Logout error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
    } finally {
      // CHỈ sau khi gọi API xong mới xóa state và localStorage
      dispatch(logout())
      localStorage.removeItem('token')

      // Xóa cookies
      document.cookie.split(';').forEach(function (c) {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
      })

      setIsMenuOpen(false)
      navigate('/')
      toast.success('Đã đăng xuất thành công')
    }
  }

  // Helper function to display user name correctly
  const getUserDisplayName = () => {
    if (!userInfo) return ''

    // Check different possible name properties based on API response structure
    if (userInfo.fullName) return userInfo.fullName
    if (userInfo.name) return userInfo.name

    return userInfo.email || 'Người dùng'
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'Admin':
        return 'Quản trị viên'
      case 'Staff':
        return 'Nhân viên'
      case 'Consultant':
        return 'Tư vấn viên'
      case 'Customer':
        return 'Khách hàng'
      case 'Manager':
        return 'Quản lý'
      default:
        return 'Khách'
    }
  }

  const guestNavItems = [
    { path: '/', label: 'Trang chủ' },
    { path: '/test-service', label: 'Dịch vụ xét nghiệm' },
    { path: '/booking-consultant', label: 'Đặt tư vấn' }, // Thêm đặt tư vấn vào đây
    { path: '/blog', label: 'Blog' },
    { path: '/cycle-tracking', label: 'Theo dõi chu kỳ' }
  ]

  // Menu items for user dropdown
  const userMenuItems = [
    {
      key: 'profile',
      label: 'Cập nhật hồ sơ',
      icon: <Settings size={14} className='mr-2' />,
      onClick: () => navigate('/profile')
    },
    {
      key: 'divider',
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogOut size={14} className='mr-2' />,
      onClick: handleLogout,
      danger: true
    }
  ]

  // Get avatar URL or use first letter of name
  const getAvatarContent = () => {
    if (!userInfo) return null

    if (userInfo.avatarUrl) {
      return <img src={userInfo.avatarUrl} alt='Avatar' />
    }

    const name = getUserDisplayName()
    return name.charAt(0).toUpperCase()
  }

  return (
    <nav className='bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link to='/' className='flex items-center space-x-2'>
            <div className='w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center'>
              {/* <Heart className='h-5 w-5 text-pink-500' /> */}
              <Heart className='h-5 w-5 text-white' />
            </div>
            <span className='text-xl font-bold gradient-text'>WellCare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-8'>
            {isGuest
              ? guestNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                      isActivePath(item.path) ? 'text-primary-500 border-b-2 border-primary-500 pb-1' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))
              : navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                      isActivePath(item.path) ? 'text-primary-500 border-b-2 border-primary-500 pb-1' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}

            {/* Cart Icon */}
            <CartIcon />

            {userInfo && <NotificationBell />}

            {/* User avatar and dropdown */}
            {userInfo ? (
              <Dropdown menu={{ items: userMenuItems }} placement='bottomRight' arrow trigger={['click']}>
                <div className='flex items-center space-x-2 cursor-pointer'>
                  <Avatar
                    size={36}
                    src={userInfo.avatarUrl}
                    className='bg-gradient-to-r from-pink-500 to-red-500'
                    style={{ color: 'white', fontWeight: 'bold' }}
                  >
                    {!userInfo.avatarUrl && getUserDisplayName().charAt(0).toUpperCase()}
                  </Avatar>
                  <div className='hidden lg:block'>
                    <span className='text-sm font-medium text-gray-700'>{getUserDisplayName()}</span>
                    <div className='flex items-center text-xs text-gray-500'>
                      <span>{getRoleDisplayName(userInfo.role)}</span>
                      <ChevronDown size={12} className='ml-1' />
                    </div>
                  </div>
                </div>
              </Dropdown>
            ) : (
              <div className='flex items-center space-x-2'>
                <Link to='/login'>
                  <Button variant='ghost' size='sm'>
                    Đăng nhập
                  </Button>
                </Link>
                <Link to='/register'>
                  <Button className='bg-gradient-primary hover:opacity-90 text-white' size='sm'>
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <Button variant='ghost' size='icon' onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className='md:hidden'>
            <div className='px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100'>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    isActivePath(item.path)
                      ? 'bg-primary-50 text-primary-500'
                      : 'text-gray-700 hover:text-primary-500 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {userInfo ? (
                <div className='px-3 py-2 border-t border-gray-100 mt-2'>
                  <div className='flex items-center space-x-3 mb-3'>
                    <Avatar
                      size={40}
                      src={userInfo.avatarUrl}
                      className='bg-gradient-to-r from-pink-500 to-red-500'
                      style={{ color: 'white', fontWeight: 'bold' }}
                    >
                      {!userInfo.avatarUrl && getUserDisplayName().charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                      <p className='text-sm font-medium text-gray-700'>{getUserDisplayName()}</p>
                      <p className='text-xs text-gray-500'>{getRoleDisplayName(userInfo.role)}</p>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        navigate('/profile')
                        setIsMenuOpen(false)
                      }}
                      className='w-full justify-start'
                    >
                      <Settings className='h-4 w-4 mr-2' />
                      Cập nhật hồ sơ
                    </Button>

                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleLogout}
                      className='w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50'
                    >
                      <LogOut className='h-4 w-4 mr-2' />
                      Đăng xuất
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='px-3 py-2 space-y-2'>
                  <Link to='/login' onClick={() => setIsMenuOpen(false)}>
                    <Button variant='ghost' size='sm' className='w-full'>
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link to='/register' onClick={() => setIsMenuOpen(false)}>
                    <Button className='w-full bg-gradient-primary hover:opacity-90 text-white' size='sm'>
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
