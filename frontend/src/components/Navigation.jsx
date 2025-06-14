import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Heart, Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [{ path: '/', label: 'Trang chủ' }]

    if (!user) {
      return [
        ...baseItems,
        { path: '/services', label: 'Dịch vụ xét nghiệm' },
        { path: '/consultation', label: 'Đặt tư vấn' },
        { path: '/blog', label: 'Blog' },
        { path: '/cycle-tracking', label: 'Theo dõi chu kỳ' }
      ]
    }

    switch (user.role) {
      case 'admin':
        return [
          { path: '/admin', label: 'Quản lý hệ thống' },
          { path: '/staff-management', label: 'Quản lý nội dung' },
          { path: '/blog', label: 'Blog' }
        ]

      case 'staff':
        return [
          { path: '/staff-management', label: 'Quản lý Blog & Dịch vụ' },
          { path: '/blog', label: 'Blog' },
          { path: '/dich-vu', label: 'Dịch vụ' }
        ]

      case 'consultant':
        return [
          { path: '/consultant-dashboard', label: 'Dashboard' },
          { path: '/tu-van', label: 'Lịch tư vấn' },
          { path: '/blog', label: 'Blog' }
        ]

      case 'user':
        return [
          { path: '/user-dashboard', label: 'Dashboard' },
          { path: '/dich-vu', label: 'Dịch vụ xét nghiệm' },
          { path: '/tu-van', label: 'Đặt tư vấn' },
          { path: '/blog', label: 'Blog' },
          { path: '/chu-ky', label: 'Theo dõi chu kỳ' }
        ]

      default:
        return baseItems
    }
  }

  const navItems = getNavItems()

  const isActivePath = (path) => {
    return location.pathname === path
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên'
      case 'staff':
        return 'Nhân viên'
      case 'consultant':
        return 'Tư vấn viên'
      case 'user':
        return 'Người dùng'
      default:
        return 'Khách'
    }
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
            {navItems.map((item) => (
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

            {user ? (
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-2'>
                  <User className='h-4 w-4 text-gray-600' />
                  <span className='text-sm text-gray-700'>
                    {user.name} ({getRoleDisplayName(user.role)})
                  </span>
                </div>
                <Button variant='ghost' size='sm' onClick={handleLogout}>
                  <LogOut className='h-4 w-4 mr-2' />
                  Đăng xuất
                </Button>
              </div>
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

              {user ? (
                <div className='px-3 py-2 border-t border-gray-100 mt-2'>
                  <p className='text-sm text-gray-600 mb-2'>
                    {user.name} ({getRoleDisplayName(user.role)})
                  </p>
                  <Button variant='ghost' size='sm' onClick={handleLogout} className='w-full justify-start'>
                    <LogOut className='h-4 w-4 mr-2' />
                    Đăng xuất
                  </Button>
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
