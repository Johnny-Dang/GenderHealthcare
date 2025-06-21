import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Typography, Divider, Table, Tag } from 'antd'
import {
  UserOutlined,
  MedicineBoxOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  ArrowUpOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

const DashboardHome = () => {
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({
    users: 0,
    services: 0,
    totalRevenue: 0,
    appointments: 0
  })
  const [recentAppointments, setRecentAppointments] = useState([])

  useEffect(() => {
    // Mock data - replace with API call if needed
    setTimeout(() => {
      setStatistics({
        users: 1254,
        services: 28,
        totalRevenue: 458600000,
        appointments: 825
      })
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
    }, 800)
  }, [])

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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
          </Card>
        </Col>
      </Row>

      {/* Recent Appointments Table */}
      <div className='mt-8'>
        <Title level={5} className='mb-3'>
          Lịch hẹn gần đây
        </Title>
        <Table
          columns={appointmentColumns}
          dataSource={recentAppointments}
          pagination={false}
          rowClassName='hover:bg-pink-50'
          size='small'
          className='recent-appointments-table'
          loading={loading}
        />
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
