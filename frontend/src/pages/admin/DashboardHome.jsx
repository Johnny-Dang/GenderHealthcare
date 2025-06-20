import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Typography, Divider, List, Avatar, Progress, Table, Tag } from 'antd'
import {
  UserOutlined,
  MedicineBoxOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons'
import { Line, Pie } from '@ant-design/charts'

const { Title, Text } = Typography

const DashboardHome = () => {
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({
    users: 0,
    services: 0,
    totalRevenue: 0,
    appointments: 0
  })
  const [revenueData, setRevenueData] = useState([])
  const [appointmentData, setAppointmentData] = useState([])
  const [popularServices, setPopularServices] = useState([])
  const [recentAppointments, setRecentAppointments] = useState([])

  useEffect(() => {
    // Fetch data from API
    // This is mock data - replace with actual API calls
    const fetchDashboardData = async () => {
      try {
        // Mock API delay
        setTimeout(() => {
          // Set statistics
          setStatistics({
            users: 1254,
            services: 28,
            totalRevenue: 458600000,
            appointments: 825
          })

          // Set revenue data for chart
          setRevenueData([
            { date: '01/05/2023', revenue: 15200000 },
            { date: '02/05/2023', revenue: 18500000 },
            { date: '03/05/2023', revenue: 14800000 },
            { date: '04/05/2023', revenue: 17300000 },
            { date: '05/05/2023', revenue: 19800000 },
            { date: '06/05/2023', revenue: 24500000 },
            { date: '07/05/2023', revenue: 21200000 }
          ])

          // Set appointment data for chart
          setAppointmentData([
            { type: 'Xét nghiệm máu', value: 35 },
            { type: 'Siêu âm', value: 28 },
            { type: 'Nội tiết', value: 18 },
            { type: 'Thai sản', value: 19 }
          ])

          // Popular services
          setPopularServices([
            {
              name: 'Siêu âm thai nhi 4D',
              category: 'Siêu âm',
              appointments: 145,
              growth: 12
            },
            {
              name: 'Xét nghiệm máu cơ bản',
              category: 'Xét nghiệm máu',
              appointments: 132,
              growth: 8
            },
            {
              name: 'Khám sức khỏe phụ nữ mang thai',
              category: 'Thai sản',
              appointments: 98,
              growth: 15
            },
            {
              name: 'Kiểm tra nội tiết tố nữ',
              category: 'Nội tiết',
              appointments: 87,
              growth: -3
            },
            {
              name: 'Sàng lọc trước sinh',
              category: 'Thai sản',
              appointments: 76,
              growth: 10
            }
          ])

          // Recent appointments
          setRecentAppointments([
            {
              id: 'AP001',
              patientName: 'Nguyễn Thị A',
              service: 'Siêu âm thai nhi 4D',
              date: '07/05/2023',
              status: 'Đã hoàn thành'
            },
            {
              id: 'AP002',
              patientName: 'Trần Thị B',
              service: 'Xét nghiệm máu cơ bản',
              date: '07/05/2023',
              status: 'Đang chờ'
            },
            {
              id: 'AP003',
              patientName: 'Lê Thị C',
              service: 'Kiểm tra nội tiết tố nữ',
              date: '06/05/2023',
              status: 'Đã hoàn thành'
            },
            {
              id: 'AP004',
              patientName: 'Phạm Thị D',
              service: 'Sàng lọc trước sinh',
              date: '06/05/2023',
              status: 'Đã hủy'
            }
          ])

          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // Config for Line chart
  const lineConfig = {
    data: revenueData,
    height: 300,
    xField: 'date',
    yField: 'revenue',
    point: {
      size: 5,
      shape: 'diamond'
    },
    tooltip: {
      formatter: (datum) => {
        return { name: 'Doanh thu', value: formatNumber(datum.revenue) + ' VND' }
      }
    },
    smooth: true,
    lineStyle: {
      stroke: '#ff4d94',
      lineWidth: 3
    },
    areaStyle: {
      fill: 'l(270) 0:#fff 0.5:#ffd6e7 1:#ff4d94'
    }
  }

  // Config for Pie chart
  const pieConfig = {
    data: appointmentData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'outer',
      content: '{percentage}'
    },
    interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
    statistic: {
      title: {
        content: 'Tổng',
        style: {
          color: '#ff4d94',
          fontSize: '14px'
        }
      },
      content: {
        style: {
          color: '#ff4d94',
          fontWeight: 'bold',
          fontSize: '20px'
        },
        formatter: () => '100%'
      }
    },
    legend: {
      position: 'bottom'
    },
    color: ['#ff4d94', '#ff85c0', '#ffc1e3', '#ffd6e7']
  }

  // Columns for recent appointments table
  const appointmentColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '15%'
    },
    {
      title: 'Tên bệnh nhân',
      dataIndex: 'patientName',
      key: 'patientName',
      width: '25%',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'service',
      key: 'service',
      width: '30%'
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: '15%'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => {
        let color = 'blue'
        if (status === 'Đã hoàn thành') color = 'green'
        else if (status === 'Đã hủy') color = 'volcano'
        return <Tag color={color}>{status}</Tag>
      }
    }
  ]

  return (
    <div className='dashboard-home'>
      <div className='mb-6'>
        <Title level={3} className='text-gray-800 mb-1'>
          Bảng điều khiển
        </Title>
        <Text type='secondary'>Tổng quan về hoạt động của hệ thống</Text>
        <Divider className='mt-4 mb-6' />
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className='dashboard-card' loading={loading}>
            <Statistic
              title='Tổng người dùng'
              value={statistics.users}
              prefix={<UserOutlined className='text-pink-500 mr-2' />}
              valueStyle={{ color: '#ff4d94' }}
            />
            <div className='mt-2'>
              <Text type='secondary' className='text-sm'>
                <ArrowUpOutlined className='mr-1 text-green-500' />
                15% so với tháng trước
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className='dashboard-card' loading={loading}>
            <Statistic
              title='Tổng dịch vụ'
              value={statistics.services}
              prefix={<MedicineBoxOutlined className='text-pink-500 mr-2' />}
              valueStyle={{ color: '#ff4d94' }}
            />
            <div className='mt-2'>
              <Text type='secondary' className='text-sm'>
                <ArrowUpOutlined className='mr-1 text-green-500' />
                5% so với tháng trước
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className='dashboard-card' loading={loading}>
            <Statistic
              title='Tổng doanh thu'
              value={statistics.totalRevenue}
              formatter={(value) => `${formatNumber(value)} VND`}
              prefix={<DollarCircleOutlined className='text-pink-500 mr-2' />}
              valueStyle={{ color: '#ff4d94' }}
            />
            <div className='mt-2'>
              <Text type='secondary' className='text-sm'>
                <ArrowUpOutlined className='mr-1 text-green-500' />
                8% so với tháng trước
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className='dashboard-card' loading={loading}>
            <Statistic
              title='Lượt khám'
              value={statistics.appointments}
              prefix={<CalendarOutlined className='text-pink-500 mr-2' />}
              valueStyle={{ color: '#ff4d94' }}
            />
            <div className='mt-2'>
              <Text type='secondary' className='text-sm'>
                <ArrowUpOutlined className='mr-1 text-green-500' />
                12% so với tháng trước
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className='mt-6'>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Title level={5} className='m-0'>
                <DollarCircleOutlined className='mr-2 text-pink-500' />
                Doanh thu 7 ngày gần nhất
              </Title>
            }
            bordered={false}
            className='dashboard-card'
            loading={loading}
          >
            {!loading && <Line {...lineConfig} />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Title level={5} className='m-0'>
                <CalendarOutlined className='mr-2 text-pink-500' />
                Phân bổ lịch khám
              </Title>
            }
            bordered={false}
            className='dashboard-card'
            loading={loading}
          >
            {!loading && <Pie {...pieConfig} />}
          </Card>
        </Col>
      </Row>

      {/* Popular Services and Recent Appointments */}
      <Row gutter={[16, 16]} className='mt-6'>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Title level={5} className='m-0'>
                <MedicineBoxOutlined className='mr-2 text-pink-500' />
                Dịch vụ phổ biến
              </Title>
            }
            bordered={false}
            className='dashboard-card'
            loading={loading}
          >
            <List
              itemLayout='horizontal'
              dataSource={popularServices}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={<MedicineBoxOutlined />} className='bg-gradient-to-r from-pink-400 to-pink-600' />
                    }
                    title={<Text strong>{item.name}</Text>}
                    description={
                      <div>
                        <Tag color='blue' className='mb-1'>
                          {item.category}
                        </Tag>
                        <div className='flex items-center justify-between'>
                          <Progress
                            percent={(item.appointments / 150) * 100}
                            showInfo={false}
                            strokeColor={{
                              '0%': '#ff85c0',
                              '100%': '#ff4d94'
                            }}
                          />
                          <div className='flex items-center'>
                            <Text className='mr-2'>{item.appointments} lịch hẹn</Text>
                            {item.growth > 0 ? (
                              <Text type='success'>
                                <ArrowUpOutlined /> {item.growth}%
                              </Text>
                            ) : (
                              <Text type='danger'>
                                <ArrowDownOutlined /> {Math.abs(item.growth)}%
                              </Text>
                            )}
                          </div>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Title level={5} className='m-0'>
                <CalendarOutlined className='mr-2 text-pink-500' />
                Lịch hẹn gần đây
              </Title>
            }
            bordered={false}
            className='dashboard-card'
            loading={loading}
          >
            <Table
              columns={appointmentColumns}
              dataSource={recentAppointments}
              pagination={false}
              rowClassName='hover:bg-pink-50'
              size='small'
              className='recent-appointments-table'
            />
          </Card>
        </Col>
      </Row>

      <style jsx global>{`
        .dashboard-card {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
          border-radius: 8px;
          transition: all 0.3s;
        }

        .dashboard-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .recent-appointments-table .ant-table-cell {
          padding: 12px 8px;
        }

        .dashboard-card .ant-card-head {
          border-bottom: 1px solid #f5f5f5;
          padding: 0 16px;
        }

        .dashboard-card .ant-statistic-title {
          color: rgba(0, 0, 0, 0.45);
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}

export default DashboardHome
