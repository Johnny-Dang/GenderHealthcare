import React from 'react'
import { Typography, Table, Card, Button, Tag, Space, Badge, Tabs } from 'antd'
import { CalendarPlus, Search, Filter, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'

const { Title, Text } = Typography

const AppointmentsManagement = () => {
  // Dữ liệu mẫu - trong thực tế sẽ được lấy từ API
  const sampleData = [
    {
      id: 1,
      customerName: 'Nguyễn Văn A',
      customerEmail: 'nguyenvana@example.com',
      date: '2023-12-01',
      time: '09:00 AM',
      testServices: ['Xét nghiệm máu cơ bản', 'Đo huyết áp'],
      status: 'confirmed',
      phone: '0901234567',
      notes: 'Khách hàng đến sớm 15 phút'
    },
    {
      id: 2,
      customerName: 'Trần Thị B',
      customerEmail: 'tranthi@example.com',
      date: '2023-12-01',
      time: '10:30 AM',
      testServices: ['Xét nghiệm máu toàn diện'],
      status: 'pending',
      phone: '0912345678',
      notes: ''
    },
    {
      id: 3,
      customerName: 'Lê Hoàng C',
      customerEmail: 'lehoang@example.com',
      date: '2023-12-02',
      time: '02:00 PM',
      testServices: ['Xét nghiệm nội tiết tố', 'Siêu âm'],
      status: 'completed',
      phone: '0978901234',
      notes: 'Cần liên hệ thêm để thông báo kết quả'
    }
  ]

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '5%'
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: '15%',
      render: (text, record) => (
        <div>
          <div className='font-medium'>{text}</div>
          <div className='text-xs text-gray-500'>{record.customerEmail}</div>
        </div>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: '12%'
    },
    {
      title: 'Ngày giờ hẹn',
      key: 'datetime',
      width: '15%',
      render: (_, record) => (
        <div>
          <div>{record.date}</div>
          <div className='text-gray-500'>{record.time}</div>
        </div>
      )
    },
    {
      title: 'Dịch vụ xét nghiệm',
      dataIndex: 'testServices',
      key: 'testServices',
      width: '20%',
      render: (services) => (
        <>
          {services.map((service) => (
            <Tag key={service} className='mb-1 mr-1'>
              {service}
            </Tag>
          ))}
        </>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '13%',
      render: (status) => {
        let color = 'default'
        let icon = <Clock size={14} />
        let text = 'Chờ xác nhận'

        if (status === 'confirmed') {
          color = 'processing'
          icon = <CheckCircle size={14} />
          text = 'Đã xác nhận'
        } else if (status === 'completed') {
          color = 'success'
          icon = <FileText size={14} />
          text = 'Đã hoàn thành'
        } else if (status === 'cancelled') {
          color = 'error'
          icon = <XCircle size={14} />
          text = 'Đã hủy'
        }

        return <Badge status={color} text={text} icon={icon} />
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Space size='small'>
          <Button type='primary' size='small'>
            Chi tiết
          </Button>
          <Button size='small'>Cập nhật</Button>
        </Space>
      )
    }
  ]

  // Tabs cho các trạng thái khác nhau
  const items = [
    {
      key: 'all',
      label: 'Tất cả lịch hẹn',
      children: <Table columns={columns} dataSource={sampleData} rowKey='id' pagination={{ pageSize: 10 }} />
    },
    {
      key: 'pending',
      label: 'Chờ xác nhận',
      children: (
        <Table
          columns={columns}
          dataSource={sampleData.filter((item) => item.status === 'pending')}
          rowKey='id'
          pagination={{ pageSize: 10 }}
        />
      )
    },
    {
      key: 'confirmed',
      label: 'Đã xác nhận',
      children: (
        <Table
          columns={columns}
          dataSource={sampleData.filter((item) => item.status === 'confirmed')}
          rowKey='id'
          pagination={{ pageSize: 10 }}
        />
      )
    },
    {
      key: 'completed',
      label: 'Đã hoàn thành',
      children: (
        <Table
          columns={columns}
          dataSource={sampleData.filter((item) => item.status === 'completed')}
          rowKey='id'
          pagination={{ pageSize: 10 }}
        />
      )
    }
  ]

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <Title level={2}>Quản lý lịch hẹn xét nghiệm</Title>
          <Text type='secondary'>Quản lý và theo dõi các lịch hẹn xét nghiệm của khách hàng</Text>
        </div>
        <Button type='primary' icon={<CalendarPlus size={16} />}>
          Thêm lịch hẹn mới
        </Button>
      </div>

      <div className='mb-4 flex justify-between'>
        <div className='flex gap-4'>
          <div className='w-64'>
            <input
              type='text'
              placeholder='Tìm kiếm theo tên, email...'
              className='w-full p-2 border border-gray-300 rounded'
            />
          </div>
          <Button icon={<Search size={16} />}>Tìm kiếm</Button>
        </div>
        <div>
          <Button icon={<Filter size={16} />}>Lọc</Button>
        </div>
      </div>

      <Card className='border-0 shadow-md'>
        <Tabs defaultActiveKey='all' items={items} />
      </Card>

      <div className='mt-6 text-center text-gray-500'>
        <Text type='secondary'>
          Đây là giao diện mẫu. Tính năng quản lý lịch hẹn sẽ được phát triển đầy đủ trong phiên bản tới.
        </Text>
      </div>
    </div>
  )
}

export default AppointmentsManagement
