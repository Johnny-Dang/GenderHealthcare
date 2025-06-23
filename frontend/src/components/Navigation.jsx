import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Dropdown, Menu, Avatar, ConfigProvider } from 'antd'
import { Heart, Menu as MenuIcon, X, User, LogOut } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'

import api from '../configs/axios'
import { logout } from '../redux/features/userSlice'

// Disable antd compatibility warning
ConfigProvider.config({
  warning: false
})

const Navigation = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const isGuest = !user || !user.isAuthenticated

  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [{ path: '/', label: 'Trang chủ' }]

    if (isGuest) {
      return [
        ...baseItems,
        { path: '/test-service', label: 'Dịch vụ xét nghiệm' },
        { path: '/blog', label: 'Blog' },
        { path: '/cycle-tracking', label: 'Theo dõi chu kỳ' },
        { path: '/booking', label: 'Đặt tư vấn' }
      ]
    }

    // Kiểm tra role tồn tại để tránh lỗi
    if (!user.role) return baseItems

    switch (user.role) {
      case 'Staff':
        return [
          { path: '/staff/blog', label: 'Quản lý Blog & Dịch vụ' },
          { path: '/blog', label: 'Blog' },
          { path: '/dich-vu', label: 'Dịch vụ' }
        ]

      case 'Consultant':
        return [
          { path: '/consultant-dashboard', label: 'Dashboard' },
          { path: '/tu-van', label: 'Lịch tư vấn' },
          { path: '/blog', label: 'Blog' }
        ]

      case 'Customer':
        return [
          { path: '/customer-dashboard', label: 'Dashboard' },
          { path: '/test-service', label: 'Dịch vụ xét nghiệm' },
          { path: '/tu-van', label: 'Đặt tư vấn' },
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

  // Đăng xuất: gọi API trước, sau đó mới xóa token và chuyển trang
  const handleLogout = () => {
    api
      .post('Account/logout')
      .catch(() => {}) // Không cần xử lý lỗi
      .finally(() => {
        dispatch(logout())
        navigate('/')
      })
  }

  const handleProfile = () => {
    navigate('/profile') // hoặc đường dẫn trang thông tin cá nhân của bạn
  }

  // Menu cho avatar dropdown
  const avatarMenu = (
    <Menu>
      <Menu.Item key='profile' icon={<User size={16} />} onClick={handleProfile}>
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key='logout' icon={<LogOut size={16} />} onClick={handleLogout} danger>
        Đăng xuất
      </Menu.Item>
    </Menu>
  )

  const guestNavItems = [
    { path: '/', label: 'Trang chủ' },
    { path: '/test-service', label: 'Dịch vụ xét nghiệm' },
    { path: '/blog', label: 'Blog' },
    { path: '/cycle-tracking', label: 'Theo dõi chu kỳ' }
  ]

  // Button đăng xuất trực tiếp cho mobile menu
  const directLogout = () => {
    api
      .post('Account/logout')
      .catch(() => {})
      .finally(() => {
        dispatch(logout())
        navigate('/')
      })
  }

  return (
    <>
      <nav className='bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            {/* Logo */}
            <Link to='/' className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center'>
                <Heart className='h-5 w-5 text-white' />
              </div>
              <span className='text-xl font-bold gradient-text'>WellCare</span>
            </Link>

            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center space-x-8'>
              {(isGuest ? guestNavItems : getNavItems()).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                    location.pathname === item.path
                      ? 'text-primary-500 border-b-2 border-primary-500 pb-1'
                      : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {user && user.isAuthenticated ? (
                <Dropdown overlay={avatarMenu} trigger={['click']} placement='bottomRight' arrow>
                  <div className='flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-pink-50 transition-colors'>
                    <Avatar size={36} className='bg-gradient-to-r from-pink-500 to-red-500' icon={<User size={20} />} />
                    <span className='text-base text-gray-700 font-semibold'>
                      {user.currentUser?.name || 'Tài khoản'}
                    </span>
                  </div>
                </Dropdown>
              ) : (
                <div className='flex items-center space-x-2'>
                  <Link to='/login'>
                    <Button
                      type='default'
                      size='large'
                      className='rounded-md font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                      style={{ minWidth: 110 }}
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link to='/register'>
                    <Button
                      type='primary'
                      size='large'
                      className='rounded-md font-semibold bg-gradient-primary hover:opacity-90 text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 border-0'
                      style={{ minWidth: 110 }}
                    >
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className='md:hidden'>
              <Button type='text' onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className='h-6 w-6' /> : <MenuIcon className='h-6 w-6' />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation giữ nguyên, có thể thêm avatar + menu tương tự nếu muốn */}
          {isMenuOpen && (
            <div className='md:hidden py-4'>
              <div className='flex flex-col space-y-2'>
                {(isGuest ? guestNavItems : getNavItems()).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-md ${
                      location.pathname === item.path
                        ? 'bg-pink-50 text-pink-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {user && user.isAuthenticated ? (
                  <div className='border-t border-gray-100 mt-2 pt-2'>
                    <div
                      className='px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer flex items-center'
                      onClick={() => {
                        handleProfile()
                        setIsMenuOpen(false)
                      }}
                    >
                      <User size={16} className='mr-2' />
                      Thông tin cá nhân
                    </div>
                    <div
                      className='px-4 py-2 text-red-500 hover:bg-red-50 rounded-md cursor-pointer flex items-center'
                      onClick={directLogout}
                    >
                      <LogOut size={16} className='mr-2' />
                      Đăng xuất
                    </div>
                  </div>
                ) : (
                  <div className='border-t border-gray-100 mt-2 pt-2 px-4 flex flex-col space-y-2'>
                    <Link to='/login' className='w-full' onClick={() => setIsMenuOpen(false)}>
                      <Button type='default' block>
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link to='/register' className='w-full' onClick={() => setIsMenuOpen(false)}>
                      <Button type='primary' block className='bg-gradient-primary border-0'>
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
    </>
  )
}
export default Navigation
