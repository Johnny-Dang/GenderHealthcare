import React, { useState, useEffect } from 'react'
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { Layout, Menu, theme, Avatar, Badge, Typography, Button, Breadcrumb, Dropdown } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/features/userSlice'
import { PieChart, Users, Package, ChevronLeft, ChevronRight, UserCircle, Heart, LogOut } from 'lucide-react'
import api from '../../configs/axios'

const { Header, Content, Footer, Sider } = Layout
const { Text } = Typography

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label: <Link to={`/admin/${key}`}>{label}</Link>
  }
}

const items = [
  getItem('Dashboard', 'dashboard', <PieChart size={18} />),
  getItem('Quản lý người dùng', 'users', <Users size={18} />),
  getItem('Quản lý dịch vụ xét nghiệm', 'services', <Package size={18} />)
]

const AdminPage = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [breadcrumbItems, setBreadcrumbItems] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)

  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  const breadcrumbMap = {
    '/admin/users': [{ title: <Link to='/admin'>Admin</Link> }, { title: 'Quản lý người dùng' }],
    '/admin/services': [{ title: <Link to='/admin'>Admin</Link> }, { title: 'Quản lý dịch vụ xét nghiệm' }],
    '/admin/dashboard': [{ title: <Link to='/admin'>Admin</Link> }, { title: 'Dashboard' }]
  }

  useEffect(() => {
    const breadcrumb = breadcrumbMap[location.pathname] || breadcrumbMap['/admin/dashboard']
    setBreadcrumbItems(breadcrumb)
  }, [location])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const getActiveMenu = () => {
    const path = location.pathname
    if (path.includes('/users')) return 'users'
    if (path.includes('/services')) return 'services'
    return 'dashboard'
  }

  // Hàm xử lý logout: gọi API trước, sau đó logout và về trang chủ
  const handleLogout = () => {
    api
      .post('Account/logout')
      .catch(() => {})
      .finally(() => {
        dispatch(logout())
        navigate('/')
      })
  }

  // Menu cho dropdown
  const menu = (
    <Menu>
      <Menu.Item key='logout' icon={<LogOut size={18} />} onClick={handleLogout} danger>
        Đăng xuất
      </Menu.Item>
    </Menu>
  )

  return (
    <Layout className='min-h-screen'>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
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
            <Dropdown overlay={menu} trigger={['click']} placement='bottomRight' arrow>
              <div className='flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-pink-50'>
                <Avatar
                  size={36}
                  className='bg-gradient-to-r from-pink-500 to-red-500'
                  icon={<UserCircle size={20} />}
                />
                <Text strong className='text-slate-700'>
                  Admin
                </Text>
              </div>
            </Dropdown>
          </div>
        </Header>

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
