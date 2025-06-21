import React, { useState, useEffect } from 'react'
import { Link, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import { Layout, Menu, theme, Avatar, Badge, Typography, Button, Breadcrumb } from 'antd'

import { PieChart, Users, Package, BarChart, ChevronLeft, ChevronRight, Bell, UserCircle, Heart } from 'lucide-react'

const { Header, Content, Footer, Sider } = Layout
const { Title, Text } = Typography

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label: <Link to={`/admin/${key}`}>{label}</Link>
  }
}

// Sử dụng icons phù hợp
const items = [
  getItem('Dashboard', 'dashboard', <PieChart size={18} />),
  getItem('Quản lý người dùng', 'users', <Users size={18} />),
  getItem('Quản lý dịch vụ xét nghiệm', 'services', <Package size={18} />)
]

const AdminPage = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [breadcrumbItems, setBreadcrumbItems] = useState([])
  const location = useLocation()

  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  // Update breadcrumb based on current path
  useEffect(() => {
    const pathSnippets = location.pathname.split('/').filter((i) => i) // Tạo breadcrumb items dựa vào đường dẫn
    if (location.pathname.includes('/users')) {
      setBreadcrumbItems([{ title: <Link to='/admin'>Admin</Link> }, { title: 'Quản lý người dùng' }])
    } else if (location.pathname.includes('/services')) {
      setBreadcrumbItems([{ title: <Link to='/admin'>Admin</Link> }, { title: 'Quản lý dịch vụ xét nghiệm' }])
    } else {
      setBreadcrumbItems([{ title: <Link to='/admin'>Admin</Link> }, { title: 'Dashboard' }])
    }
  }, [location])
  // Xác định menu active
  const getActiveMenu = () => {
    const path = location.pathname
    if (path.includes('/users')) return 'users'
    if (path.includes('/services')) return 'services'
    return 'dashboard'
  }

  return (
    <Layout className='min-h-screen'>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null} // Hide default trigger
        className='shadow-lg bg-gradient-to-b from-pink-50 to-pink-100'
        width={250}
      >
        <div className={`flex items-center mb-8 ${collapsed ? 'justify-center' : 'justify-start px-6'} h-16`}>
          <div className='w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center'>
            <Heart className='h-6 w-6 text-white' />
          </div>
          {!collapsed && (
            <span className='ml-3 text-2xl font-bold gradient-text'>
              <Link to='/' className='hover:text-pink-800'>
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
          style={{ padding: '0 24px', height: 64, backgroundColor: 'white', borderBottom: '1px solid #f0f0f0' }}
        >
          <div className='flex items-center'>
            <Button
              type='text'
              icon={collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              onClick={() => setCollapsed(!collapsed)}
              className='text-base mr-4 text-pink-500 hover:text-pink-700'
            />
            <Breadcrumb className='my-4' items={breadcrumbItems} />
          </div>

          <div className='flex items-center gap-6'>
            <Badge count={5} size='small' color='#eb2f96'>
              <Bell size={18} className='cursor-pointer text-slate-600 hover:text-pink-500' />
            </Badge>
            <div className='flex items-center gap-3'>
              <Avatar size={36} className='bg-gradient-to-r from-pink-500 to-red-500' icon={<UserCircle size={20} />} />
              <Text strong className='text-slate-700'>
                Admin
              </Text>
            </div>
          </div>
        </Header>

        {/* chổ này là chỗ hiển thị nội dung của các trang con */}
        <Content className='m-6'>
          <div className='p-6 min-h-[360px] bg-white rounded-lg shadow-md'>
            <Outlet />
          </div>
        </Content>

        <Footer className='text-center py-3 px-12 bg-pink-50 border-t border-pink-100'>
          <div className='flex items-center justify-center gap-2'>
            <Heart size={16} className='text-pink-500' />
            <Text type='secondary'>WellCare ©{new Date().getFullYear()}</Text>
          </div>
        </Footer>
      </Layout>
    </Layout>
  )
}

export default AdminPage
