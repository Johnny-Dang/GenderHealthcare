import React, { useState, useEffect } from 'react'
import { Link, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import FeedbackManagement from './feedback'
import PaymentManagement from './payment'
import StaffManagement from './staff'
import TestServiceManagement from './test-service'
import { Layout, Menu, theme, Avatar, Badge, Typography, Button, Breadcrumb, Card, Row, Col, Statistic } from 'antd'
import {
  MessageSquare,
  CreditCard,
  Users,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Bell,
  UserCircle,
  Heart,
  TrendingUp,
  Star,
  Calendar
} from 'lucide-react'

const { Header, Content, Footer, Sider } = Layout
const { Title, Text } = Typography
const { Meta } = Card

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label: <Link to={`/manager/dashboard/${key}`}>{label}</Link>
  }
}

const items = [
  getItem('Tổng quan', '', <TrendingUp size={18} />),
  getItem('Quản lý Feedback', 'feedback', <MessageSquare size={18} />),
  getItem('Quản lý Thanh toán', 'payment', <CreditCard size={18} />),
  getItem('Quản lý Nhân viên', 'staff', <Users size={18} />),
  getItem('Quản lý Dịch vụ', 'test-service', <Stethoscope size={18} />)
]

const ManagerDashboard = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [breadcrumbItems, setBreadcrumbItems] = useState([])
  const location = useLocation()

  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  const breadcrumbMap = {
    '/manager/dashboard': [{ title: 'Manager' }, { title: 'Tổng quan' }],
    '/manager/dashboard/feedback': [
      { title: <Link to='/manager/dashboard'>Manager</Link> },
      { title: 'Quản lý Feedback' }
    ],
    '/manager/dashboard/payment': [
      { title: <Link to='/manager/dashboard'>Manager</Link> },
      { title: 'Quản lý Thanh toán' }
    ],
    '/manager/dashboard/staff': [
      { title: <Link to='/manager/dashboard'>Manager</Link> },
      { title: 'Quản lý Nhân viên' }
    ],
    '/manager/dashboard/test-service': [
      { title: <Link to='/manager/dashboard'>Manager</Link> },
      { title: 'Quản lý Dịch vụ' }
    ]
  }

  // Update breadcrumb based on current path
  useEffect(() => {
    const path = location.pathname
    const exactPath = Object.keys(breadcrumbMap).find((p) => p === path)
    const breadcrumb = breadcrumbMap[exactPath] || breadcrumbMap['/manager-dashboard']
    setBreadcrumbItems(breadcrumb)
  }, [location])

  // Xác định menu active
  const getActiveMenu = () => {
    const path = location.pathname
    if (path === '/manager/dashboard') return ''
    if (path.includes('/feedback')) return 'feedback'
    if (path.includes('/payment')) return 'payment'
    if (path.includes('/staff')) return 'staff'
    if (path.includes('/test-service')) return 'test-service'
    return ''
  }

  // Dashboard overview content
  const renderDashboardOverview = () => {
    if (location.pathname === '/manager/dashboard' || location.pathname === '/manager/dashboard/') {
      return (
        <div>
          <Title level={4} className='mb-6'>
            Tổng quan Quản lý
          </Title>

          {/* Stats */}
          <Row gutter={16} className='mb-6'>
            <Col span={6}>
              <Card bordered={false} className='shadow-sm hover:shadow-md transition-all'>
                <Statistic
                  title='Tổng số Feedback'
                  value={124}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<MessageSquare size={18} className='mr-2' />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card bordered={false} className='shadow-sm hover:shadow-md transition-all'>
                <Statistic
                  title='Thanh toán tháng này'
                  value={45200000}
                  precision={0}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<CreditCard size={18} className='mr-2' />}
                  suffix='VND'
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card bordered={false} className='shadow-sm hover:shadow-md transition-all'>
                <Statistic
                  title='Tổng số Nhân viên'
                  value={18}
                  valueStyle={{ color: '#1677ff' }}
                  prefix={<Users size={18} className='mr-2' />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card bordered={false} className='shadow-sm hover:shadow-md transition-all'>
                <Statistic
                  title='Dịch vụ có sẵn'
                  value={24}
                  valueStyle={{ color: '#722ed1' }}
                  prefix={<Stethoscope size={18} className='mr-2' />}
                />
              </Card>
            </Col>
          </Row>

          {/* Quick access cards */}
          <Title level={4} className='mb-4'>
            Truy cập nhanh
          </Title>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Link to='/manager/dashboard/feedback'>
                <Card hoverable className='text-center h-52 flex flex-col justify-center items-center'>
                  <MessageSquare size={36} className='text-pink-500 mb-4' />
                  <Meta title='Quản lý Feedback' description='Xem và quản lý phản hồi từ khách hàng' />
                </Card>
              </Link>
            </Col>
            <Col span={6}>
              <Link to='/manager/dashboard/payment'>
                <Card hoverable className='text-center h-52 flex flex-col justify-center items-center'>
                  <CreditCard size={36} className='text-blue-500 mb-4' />
                  <Meta title='Quản lý Thanh toán' description='Xem và quản lý thanh toán của dịch vụ' />
                </Card>
              </Link>
            </Col>
            <Col span={6}>
              <Link to='/manager/dashboard/staff'>
                <Card hoverable className='text-center h-52 flex flex-col justify-center items-center'>
                  <Users size={36} className='text-green-500 mb-4' />
                  <Meta title='Quản lý Nhân viên' description='Xem và quản lý thông tin nhân viên' />
                </Card>
              </Link>
            </Col>
            <Col span={6}>
              <Link to='/manager/dashboard/test-service'>
                <Card hoverable className='text-center h-52 flex flex-col justify-center items-center'>
                  <Stethoscope size={36} className='text-purple-500 mb-4' />
                  <Meta title='Quản lý Dịch vụ' description='Xem và quản lý dịch vụ xét nghiệm' />
                </Card>
              </Link>
            </Col>
          </Row>

          {/* Recent activities */}
          <Title level={4} className='mt-8 mb-4'>
            Hoạt động gần đây
          </Title>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card
                title='Đánh giá gần đây'
                extra={<Link to='/manager/dashboard/feedback'>Xem tất cả</Link>}
                className='h-64'
              >
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Text strong>Nguyễn Văn A</Text>
                      <div className='flex items-center'>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <Text type='secondary'>1 giờ trước</Text>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Text strong>Trần Thị B</Text>
                      <div className='flex items-center'>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < 5 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <Text type='secondary'>3 giờ trước</Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title='Thanh toán gần đây'
                extra={<Link to='/manager/dashboard/payment'>Xem tất cả</Link>}
                className='h-64'
              >
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Text strong>Gói khám sức khỏe 1</Text>
                      <Text type='secondary' className='block'>
                        Trần Văn C
                      </Text>
                    </div>
                    <Text type='success'>2,500,000đ</Text>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Text strong>Gói khám sức khỏe 2</Text>
                      <Text type='secondary' className='block'>
                        Lê Thị D
                      </Text>
                    </div>
                    <Text type='success'>3,500,000đ</Text>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title='Lịch hẹn hôm nay' extra={<a href='#'>Xem tất cả</a>} className='h-64'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Text strong>Phạm Văn E</Text>
                      <Text type='secondary' className='block'>
                        Xét nghiệm máu
                      </Text>
                    </div>
                    <Text type='secondary'>09:30</Text>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Text strong>Vũ Thị F</Text>
                      <Text type='secondary' className='block'>
                        Tư vấn sức khỏe
                      </Text>
                    </div>
                    <Text type='secondary'>14:00</Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )
    }
    return null
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
          defaultSelectedKeys={['']}
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
            <Badge count={3} size='small' color='#eb2f96'>
              <Bell size={18} className='cursor-pointer text-slate-600 hover:text-pink-500' />
            </Badge>
            <div className='flex items-center gap-3'>
              <Avatar size={36} className='bg-gradient-to-r from-pink-500 to-red-500' icon={<UserCircle size={20} />} />
              <Text strong className='text-slate-700'>
                Manager
              </Text>
            </div>
          </div>
        </Header>

        <Content className='m-6'>
          <div className='p-6 min-h-[360px] bg-white rounded-lg shadow-md'>
            {location.pathname === '/manager/dashboard' || location.pathname === '/manager/dashboard/' ? (
              renderDashboardOverview()
            ) : (
              <Outlet />
            )}
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

export default ManagerDashboard
