import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Typography, Divider, Table, Tag, Spin, Progress, Space } from 'antd'
import { Users, UserCheck, UserX, Shield, Briefcase, HeartHandshake, User, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '../../configs/axios'
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
  ResponsiveContainer
} from 'recharts'

const { Title, Text } = Typography

const DashboardHome = () => {
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [usersByRole, setUsersByRole] = useState([])

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchUserStatistics(), fetchRecentUsers(), fetchUsersByRole()])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStatistics = async () => {
    try {
      const response = await api.get('/api/accounts/user-stats')
      setUserStats(response.data)
    } catch (error) {
      console.error('Error fetching user statistics:', error)
    }
  }

  const fetchRecentUsers = async () => {
    try {
      const response = await api.get('/api/accounts/recent-users')
      setRecentUsers(response.data)
    } catch (error) {
      console.error('Error fetching recent users:', error)
    }
  }

  const fetchUsersByRole = async () => {
    try {
      const response = await api.get('/api/accounts/users-by-role')
      setUsersByRole(response.data)
    } catch (error) {
      console.error('Error fetching users by role:', error)
    }
  }

  // Columns for recent users table
  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'accountId',
      key: 'accountId',
      width: '15%',
      render: (id) => <span className='font-mono text-sm'>{id.toString().substring(0, 8)}...</span>
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'fullName',
      key: 'fullName',
      width: '25%',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '30%'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: '15%',
      render: (isActive) => {
        let color = isActive ? 'success' : 'error'
        let text = isActive ? 'Hoạt động' : 'Ngưng hoạt động'
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createAt',
      key: 'createAt',
      width: '15%',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    }
  ]

  // Màu sắc cho biểu đồ
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  // Dữ liệu cho biểu đồ tròn
  const pieChartData = usersByRole.map((item) => ({
    name: item.roleName,
    value: item.count
  }))

  // Icon cho role
  const getRoleIcon = (roleName) => {
    switch (roleName?.toLowerCase()) {
      case 'admin':
        return <Shield size={14} className='mr-1' />
      case 'manager':
        return <Briefcase size={14} className='mr-1' />
      case 'staff':
        return <HeartHandshake size={14} className='mr-1' />
      case 'consultant':
        return <UserCheck size={14} className='mr-1' />
      case 'customer':
        return <User size={14} className='mr-1' />
      default:
        return <User size={14} className='mr-1' />
    }
  }

  return (
    <div className='dashboard-home'>
      <div className='mb-6 flex justify-between items-center'>
        <div>
          <Title level={3} className='text-gray-800 mb-1'>
            Thống kê người dùng
          </Title>
          <Text type='secondary'>Chi tiết về người dùng hệ thống</Text>
        </div>
        <Button
          onClick={fetchAllData}
          variant='outline'
          size='sm'
          disabled={loading}
          className='border-primary-500 text-primary-500 hover:bg-primary-50'
        >
          {loading ? <Spin size='small' className='mr-2' /> : <RefreshCw size={16} className='mr-2' />}
          Làm mới
        </Button>
      </div>
      <Divider className='mt-4 mb-6' />

      {/* User Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className='dashboard-card' loading={loading}>
            <Statistic
              title='Tổng người dùng'
              value={userStats.total}
              prefix={<Users className='text-pink-500 mr-2' size={20} />}
              valueStyle={{ color: '#ff4d94' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className='dashboard-card' loading={loading}>
            <Statistic
              title='Đang hoạt động'
              value={userStats.active}
              prefix={<UserCheck className='text-green-500 mr-2' size={20} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div className='mt-2'>
              <Progress
                percent={userStats.total > 0 ? Math.round((userStats.active / userStats.total) * 100) : 0}
                size='small'
                strokeColor='#52c41a'
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className='dashboard-card' loading={loading}>
            <Statistic
              title='Không hoạt động'
              value={userStats.inactive}
              prefix={<UserX className='text-orange-500 mr-2' size={20} />}
              valueStyle={{ color: '#faad14' }}
            />
            <div className='mt-2'>
              <Progress
                percent={userStats.total > 0 ? Math.round((userStats.inactive / userStats.total) * 100) : 0}
                size='small'
                strokeColor='#faad14'
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={16} className='mt-6'>
        <Col xs={24} md={12}>
          <Card title='Phân bố người dùng theo vai trò' bordered={false}>
            {loading ? (
              <div className='py-10 flex justify-center'>
                <Spin size='large' />
              </div>
            ) : pieChartData.length > 0 ? (
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
            ) : (
              <div className='py-10 text-center text-gray-500'>Không có dữ liệu</div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title='Thống kê theo vai trò' bordered={false}>
            {loading ? (
              <div className='py-10 flex justify-center'>
                <Spin size='large' />
              </div>
            ) : usersByRole.length > 0 ? (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={usersByRole} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='roleName' />
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
            ) : (
              <div className='py-10 text-center text-gray-500'>Không có dữ liệu</div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Users Table */}
      <div className='mt-6'>
        <Card
          title='Người dùng đăng ký gần đây'
          bordered={false}
          extra={<Text className='text-blue-500'>{recentUsers.length} người dùng</Text>}
        >
          <Table
            columns={userColumns}
            dataSource={recentUsers}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`
            }}
            rowClassName='hover:bg-pink-50'
            size='middle'
            loading={loading}
            rowKey='accountId'
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
