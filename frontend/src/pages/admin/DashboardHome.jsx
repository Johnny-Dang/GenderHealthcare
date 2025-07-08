import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Typography, Divider, Table, Tag, Spin, Progress, Space, DatePicker } from 'antd'
import { Users, UserCheck, UserX, UserPlus, Shield, Briefcase, HeartHandshake, User } from 'lucide-react'
import api from '../../configs/axios'
// Import các thành phần biểu đồ
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const DashboardHome = () => {
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newUsers: 0
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [usersByRole, setUsersByRole] = useState([])
  const [userTrend, setUserTrend] = useState([])

  useEffect(() => {
    // TODO: Replace with actual API calls
    fetchUserStatistics()
    fetchRecentUsers()
    fetchUsersByRole()
    fetchUserTrend()
  }, [])

  const fetchUserStatistics = () => {
    // TODO: Call API to get user statistics
    // api.get('/admin/user-statistics')
    setTimeout(() => {
      setUserStats({
        total: 1254,
        active: 1100,
        inactive: 154,
        newUsers: 45
      })
      setLoading(false)
    }, 800)
  }

  const fetchRecentUsers = () => {
    // TODO: Call API to get recent users
    // api.get('/admin/recent-users')
    setTimeout(() => {
      setRecentUsers([
        {
          id: 'USR001',
          name: 'Nguyễn Thị Anh',
          email: 'anh.nguyen@example.com',
          role: 'Customer',
          status: 'active',
          registeredDate: '2023-05-15'
        },
        {
          id: 'USR002',
          name: 'Trần Văn Bình',
          email: 'binh.tran@example.com',
          role: 'Customer',
          status: 'active',
          registeredDate: '2023-05-14'
        },
        {
          id: 'USR003',
          name: 'Lê Minh Châu',
          email: 'chau.le@example.com',
          role: 'Consultant',
          status: 'active',
          registeredDate: '2023-05-12'
        },
        {
          id: 'USR004',
          name: 'Phạm Thanh Dung',
          email: 'dung.pham@example.com',
          role: 'Staff',
          status: 'inactive',
          registeredDate: '2023-05-10'
        },
        {
          id: 'USR005',
          name: 'Hoàng Văn Em',
          email: 'em.hoang@example.com',
          role: 'Customer',
          status: 'active',
          registeredDate: '2023-05-05'
        }
      ])
    }, 1000)
  }

  const fetchUsersByRole = () => {
    // TODO: Call API to get users by role
    // api.get('/admin/users-by-role')
    setTimeout(() => {
      setUsersByRole([
        { role: 'Customer', count: 980 },
        { role: 'Consultant', count: 45 },
        { role: 'Manager', count: 12 },
        { role: 'Staff', count: 28 },
        { role: 'Admin', count: 5 }
      ])
    }, 1200)
  }

  const fetchUserTrend = () => {
    // TODO: Call API to get user trend data
    setTimeout(() => {
      setUserTrend([
        { name: 'T1', users: 120, newUsers: 120 },
        { name: 'T2', users: 240, newUsers: 120 },
        { name: 'T3', users: 380, newUsers: 140 },
        { name: 'T4', users: 470, newUsers: 90 },
        { name: 'T5', users: 580, newUsers: 110 },
        { name: 'T6', users: 690, newUsers: 110 },
        { name: 'T7', users: 780, newUsers: 90 },
        { name: 'T8', users: 890, newUsers: 110 },
        { name: 'T9', users: 980, newUsers: 90 },
        { name: 'T10', users: 1080, newUsers: 100 },
        { name: 'T11', users: 1180, newUsers: 100 },
        { name: 'T12', users: 1254, newUsers: 74 }
      ])
    }, 1200)
  }

  // Columns for recent users table
  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '10%'
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '25%'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: '15%',
      render: (role) => {
        let color = 'default'
        let icon = null

        switch (role) {
          case 'Admin':
            color = 'purple'
            icon = <Shield size={14} className='mr-1' />
            break
          case 'Manager':
            color = 'magenta'
            icon = <Briefcase size={14} className='mr-1' />
            break
          case 'Staff':
            color = 'blue'
            icon = <HeartHandshake size={14} className='mr-1' />
            break
          case 'Consultant':
            color = 'green'
            icon = <UserCheck size={14} className='mr-1' />
            break
          case 'Customer':
            color = 'cyan'
            icon = <User size={14} className='mr-1' />
            break
          default:
            color = 'default'
        }

        return (
          <Tag color={color}>
            <span className='flex items-center'>
              {icon}
              {role}
            </span>
          </Tag>
        )
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => {
        let color = status === 'active' ? 'success' : 'error'
        let text = status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'registeredDate',
      key: 'registeredDate',
      width: '15%'
    }
  ]

  // Màu sắc cho biểu đồ tròn
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  // Dữ liệu cho biểu đồ tròn
  const pieChartData = usersByRole.map((item) => ({
    name: item.role,
    value: item.count
  }))

  return (
    <div className='dashboard-home'>
      <div className='mb-6 flex justify-between items-center'>
        <div>
          <Title level={3} className='text-gray-800 mb-1'>
            Thống kê người dùng
          </Title>
          <Text type='secondary'>Chi tiết về người dùng hệ thống</Text>
        </div>
        <Space>
          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            format='DD/MM/YYYY'
            // TODO: Add onChange handler for date filtering
            // onChange={onDateRangeChange}
          />
        </Space>
      </div>
      <Divider className='mt-4 mb-6' />

      {/* User Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className='dashboard-card' loading={loading}>
            <Statistic
              title='Tổng người dùng'
              value={userStats.total}
              prefix={<Users className='text-pink-500 mr-2' size={20} />}
              valueStyle={{ color: '#ff4d94' }}
            />
            <div className='mt-2'>
              <Text type='secondary'>{userStats.newUsers} người dùng mới trong tháng</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className='dashboard-card' loading={loading}>
            <Statistic
              title='Đang hoạt động'
              value={userStats.active}
              prefix={<UserCheck className='text-green-500 mr-2' size={20} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div className='mt-2'>
              <Progress
                percent={Math.round((userStats.active / userStats.total) * 100)}
                size='small'
                strokeColor='#52c41a'
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className='dashboard-card' loading={loading}>
            <Statistic
              title='Không hoạt động'
              value={userStats.inactive}
              prefix={<UserX className='text-orange-500 mr-2' size={20} />}
              valueStyle={{ color: '#faad14' }}
            />
            <div className='mt-2'>
              <Progress
                percent={Math.round((userStats.inactive / userStats.total) * 100)}
                size='small'
                strokeColor='#faad14'
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className='dashboard-card' loading={loading}>
            <Statistic
              title='Người dùng mới'
              value={userStats.newUsers}
              prefix={<UserPlus className='text-blue-500 mr-2' size={20} />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className='mt-2'>
              <Text type='secondary'>Trong 30 ngày qua</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Thêm biểu đồ phát triển người dùng */}
      <Row gutter={16} className='mt-6'>
        <Col span={24}>
          <Card title='Phát triển người dùng theo thời gian' bordered={false}>
            {loading ? (
              <div className='py-10 flex justify-center'>
                <Spin />
              </div>
            ) : (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={userTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} người dùng`, '']}
                      labelFormatter={(label) => `Tháng ${label.substring(1)}`}
                    />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='users'
                      name='Tổng người dùng'
                      stroke='#8884d8'
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line type='monotone' dataKey='newUsers' name='Người dùng mới' stroke='#82ca9d' strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Thay thế cách hiển thị phân bố vai trò bằng biểu đồ */}
      <Row gutter={16} className='mt-6'>
        <Col xs={24} md={12}>
          <Card title='Phân bố người dùng theo vai trò' bordered={false}>
            {loading ? (
              <div className='py-10 flex justify-center'>
                <Spin />
              </div>
            ) : (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      outerRadius={100}
                      fill='#8884d8'
                      dataKey='value'
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} người dùng`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title='Người dùng theo vai trò' bordered={false}>
            {loading ? (
              <div className='py-10 flex justify-center'>
                <Spin />
              </div>
            ) : (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={usersByRole} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='role' />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} người dùng`, '']} />
                    <Bar dataKey='count' name='Số lượng' fill='#8884d8' barSize={50}>
                      {usersByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Users Table */}
      <div className='mt-6'>
        <Card
          title='Người dùng đăng ký gần đây'
          bordered={false}
          extra={
            <a href='#/admin/users' className='text-blue-500'>
              Xem tất cả
            </a>
          }
        >
          <Table
            columns={userColumns}
            dataSource={recentUsers}
            pagination={false}
            rowClassName='hover:bg-pink-50'
            size='middle'
            loading={loading}
          />
        </Card>
      </div>

      <style jsx global>{`
        .dashboard-card {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
          border-radius: 8px;
          transition: all 0.3s;
        }
        .dashboard-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .ant-card-head-title {
          font-weight: 600;
        }
        .recharts-default-tooltip {
          background-color: rgba(255, 255, 255, 0.9) !important;
          border-radius: 6px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
          padding: 8px !important;
        }
      `}</style>
    </div>
  )
}

export default DashboardHome
