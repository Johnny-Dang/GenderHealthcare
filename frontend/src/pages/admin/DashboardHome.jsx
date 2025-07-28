import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Typography, Divider, Table, Tag, Spin, Progress } from 'antd'
import { Users, UserCheck, UserX, RefreshCw } from 'lucide-react'
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
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'}>{isActive ? 'Hoạt động' : 'Ngưng hoạt động'}</Tag>
      )
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createAt',
      key: 'createAt',
      width: '15%',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    }
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  const pieChartData = usersByRole.map((item) => ({
    name: item.roleName,
    value: item.count
  }))

  const getPercentage = (value, total) => (total > 0 ? Math.round((value / total) * 100) : 0)

  const renderChart = (data, ChartComponent, chartProps) => {
    if (loading) {
      return (
        <div className='py-10 flex justify-center'>
          <Spin size='large' />
        </div>
      )
    }

    if (data.length === 0) {
      return <div className='py-10 text-center text-gray-500'>Không có dữ liệu</div>
    }

    return (
      <div style={{ height: 300 }}>
        <ResponsiveContainer width='100%' height='100%'>
          <ChartComponent {...chartProps} />
        </ResponsiveContainer>
      </div>
    )
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

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading} className='dashboard-card'>
            <Statistic
              title='Tổng người dùng'
              value={userStats.total}
              prefix={<Users className='text-pink-500 mr-2' size={20} />}
              valueStyle={{ color: '#ff4d94' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading} className='dashboard-card'>
            <Statistic
              title='Đang hoạt động'
              value={userStats.active}
              prefix={<UserCheck className='text-green-500 mr-2' size={20} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div className='mt-2'>
              <Progress
                percent={getPercentage(userStats.active, userStats.total)}
                size='small'
                strokeColor='#52c41a'
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading} className='dashboard-card'>
            <Statistic
              title='Không hoạt động'
              value={userStats.inactive}
              prefix={<UserX className='text-orange-500 mr-2' size={20} />}
              valueStyle={{ color: '#faad14' }}
            />
            <div className='mt-2'>
              <Progress
                percent={getPercentage(userStats.inactive, userStats.total)}
                size='small'
                strokeColor='#faad14'
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className='mt-6'>
        <Col xs={24} md={12}>
          <Card title='Phân bố người dùng theo vai trò'>
            {renderChart(pieChartData, PieChart, {
              children: [
                <Pie
                  key='pie'
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
                </Pie>,
                <Tooltip key='tooltip' formatter={(value) => [`${value} người dùng`, '']} />,
                <Legend key='legend' />
              ]
            })}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title='Thống kê theo vai trò'>
            {renderChart(usersByRole, BarChart, {
              data: usersByRole,
              margin: { top: 5, right: 30, left: 20, bottom: 5 },
              children: [
                <CartesianGrid key='grid' strokeDasharray='3 3' />,
                <XAxis key='xaxis' dataKey='roleName' />,
                <YAxis key='yaxis' />,
                <Tooltip key='tooltip' formatter={(value) => [`${value} người dùng`, '']} />,
                <Bar key='bar' dataKey='count' name='Số lượng' fill='#8884d8' barSize={50}>
                  {usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              ]
            })}
          </Card>
        </Col>
      </Row>

      <div className='mt-6'>
        <Card
          title='Người dùng đăng ký gần đây'
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
    </div>
  )
}

export default DashboardHome
