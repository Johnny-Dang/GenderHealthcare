import React, { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, theme, Avatar, Badge, Typography, Button, Breadcrumb, Dropdown } from 'antd'
import {
  FileText,
  Calendar,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Heart,
  TrendingUp,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react'
import api from '../../configs/axios'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/features/userSlice'
import { toast } from 'react-toastify'

const { Header, Content, Footer, Sider } = Layout
const { Text } = Typography

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label: <Link to={`/staff/${key}`}>{label}</Link>
  }
}

const items = [
  getItem('Tổng quan', 'dashboard', <TrendingUp size={18} />),
  getItem('Quản lý Blog', 'blog', <FileText size={18} />),
  getItem('Quản lý Lịch hẹn', 'appointments', <Calendar size={18} />),
  getItem('Quản lý Kết quả', 'test-results', <ClipboardCheck size={18} />)
]

const StaffLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [breadcrumbItems, setBreadcrumbItems] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userState = useSelector((state) => state.user || { userInfo: {} })
  // Access user info from different possible structures in Redux state
  const user = userState?.userInfo || userState?.user || userState || {}

  // Kiểm tra user có đăng nhập và có role Staff
  const isStaff = user?.accountId && user?.role === 'Staff'

  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  const breadcrumbMap = {
    '/staff/dashboard': [{ title: 'Staff' }, { title: 'Tổng quan' }],
    '/staff/blog': [{ title: <Link to='/staff/dashboard'>Staff</Link> }, { title: 'Quản lý Blog' }],
    '/staff/appointments': [{ title: <Link to='/staff/dashboard'>Staff</Link> }, { title: 'Quản lý Lịch hẹn' }],
    '/staff/test-results': [{ title: <Link to='/staff/dashboard'>Staff</Link> }, { title: 'Quản lý Kết quả' }]
  }

  // Update breadcrumb based on current path
  useEffect(() => {
    const path = location.pathname
    const exactPath = Object.keys(breadcrumbMap).find((p) => p === path)
    const breadcrumb = breadcrumbMap[exactPath] || breadcrumbMap['/staff/dashboard']
    setBreadcrumbItems(breadcrumb)
  }, [location])

  // Kiểm tra quyền truy cập Staff
  useEffect(() => {
    if (!isStaff) {
      console.log('Not authorized as Staff, redirecting to home')
      navigate('/')
    }
  }, [isStaff, navigate])

  // Determine active menu
  const getActiveMenu = () => {
    const path = location.pathname
    if (path === '/staff/dashboard') return 'dashboard'
    if (path.includes('/blog')) return 'blog'
    if (path.includes('/appointments')) return 'appointments'
    if (path.includes('/test-results')) return 'test-results'
    return 'dashboard'
  }

  // Get user's display name from available properties
  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.lastName} ${user.firstName}`
    }
    return user?.fullName || user?.displayName || user?.email || 'Nhân viên'
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = user?.accessToken

      if (token) {
        await api.post(
          '/Account/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      }
    } catch (error) {
      console.log('Lỗi logout API:', error)
    } finally {
      dispatch(logout())
      navigate('/')
    }
  }

  // Profile dropdown items
  const profileMenuItems = [
    {
      key: 'profile',
      label: 'Cập nhật hồ sơ',
      icon: <Settings size={16} />,
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogOut size={16} />,
      onClick: handleLogout,
      danger: true
    }
  ]

  return (
    <Layout className='min-h-screen'>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        className='shadow-lg bg-gradient-to-b from-primary-50 to-secondary-50'
        width={250}
      >
        <div className={`flex items-center mb-8 ${collapsed ? 'justify-center' : 'justify-start px-6'} h-16`}>
          <div className='w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center'>
            <Heart className='h-6 w-6 text-white' />
          </div>
          {!collapsed && (
            <span className='ml-3 text-2xl font-bold gradient-text'>
              <Link to='/' className='hover:text-primary-800'>
                WellCare
              </Link>
            </span>
          )}
        </div>

        <Menu
          theme='light'
          defaultSelectedKeys={['dashboard']}
          mode='inline'
          items={items}
          className='border-r-0 bg-transparent'
          selectedKeys={[getActiveMenu()]}
          style={{ backgroundColor: 'transparent', color: '#666' }}
        />
      </Sider>

      <Layout>
        <Header
          className='px-5 flex items-center justify-between shadow-md'
          style={{
            padding: '0 24px',
            height: 64,
            backgroundColor: 'white',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          <div className='flex items-center'>
            <Button
              type='text'
              icon={collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              onClick={() => setCollapsed(!collapsed)}
              className='text-base mr-4 text-primary-500 hover:text-primary-700 hover:bg-primary-50'
            />
            <Breadcrumb className='my-4' items={breadcrumbItems} />
          </div>

          <div className='flex items-center gap-4'>
            <Dropdown
              menu={{
                items: profileMenuItems
              }}
              placement='bottomRight'
              trigger={['click']}
              arrow
            >
              <div className='flex items-center gap-3 cursor-pointer hover:bg-primary-50 px-3 py-1.5 rounded-full transition-all border border-primary-100'>
                <Avatar
                  size={38}
                  src={user?.avatarUrl}
                  className='bg-gradient-to-r from-primary-400 to-secondary-500 border-2 border-white shadow-sm'
                  icon={<UserCircle size={22} />}
                />
                <div className='hidden md:block'>
                  <Text strong className='text-gray-800 leading-tight block'>
                    {getUserDisplayName()}
                  </Text>
                  <div className='flex items-center text-xs text-gray-500'>
                    <span>Nhân viên</span>
                    <ChevronDown size={12} className='ml-1' />
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className='m-6'>
          <div className='p-6 min-h-[360px] bg-white rounded-lg shadow-md'>
            <Outlet />
          </div>
        </Content>

        <Footer className='text-center py-3 px-12 bg-primary-50 border-t border-primary-100'>
          <div className='flex items-center justify-center gap-2'>
            <Heart size={16} className='text-primary-500' />
            <Text type='secondary'>WellCare ©{new Date().getFullYear()} - Chăm sóc sức khỏe toàn diện</Text>
          </div>
        </Footer>
      </Layout>
    </Layout>
  )
}

export default StaffLayout
