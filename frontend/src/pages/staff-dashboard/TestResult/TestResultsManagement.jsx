import React from 'react'
import { Typography, Table, Card, Button, Tag, Space, Upload, Tabs } from 'antd'
import { FilePlus2, Search, Filter, CheckCircle, UploadCloud, Download, Clock, AlertTriangle } from 'lucide-react'

const { Title, Text } = Typography

const TestResultsManagement = () => {
  // Dữ liệu mẫu - trong thực tế sẽ được lấy từ API
  const sampleData = [
    {
      id: 1,
      customerName: 'Nguyễn Văn A',
      customerEmail: 'nguyenvana@example.com',
      testDate: '2023-12-01',
      testName: 'Xét nghiệm máu cơ bản',
      status: 'pending',
      priority: 'normal',
      phone: '0901234567',
      resultUrl: null
    },
    {
      id: 2,
      customerName: 'Trần Thị B',
      customerEmail: 'tranthi@example.com',
      testDate: '2023-11-28',
      testName: 'Xét nghiệm máu toàn diện',
      status: 'completed',
      priority: 'high',
      phone: '0912345678',
      resultUrl: 'https://example.com/results/2.pdf'
    },
    {
      id: 3,
      customerName: 'Lê Hoàng C',
      customerEmail: 'lehoang@example.com',
      testDate: '2023-11-30',
      testName: 'Xét nghiệm nội tiết tố',
      status: 'processing',
      priority: 'urgent',
      phone: '0978901234',
      resultUrl: null
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
          <div className='text-xs text-gray-500'>{record.phone}</div>
        </div>
      )
    },
    {
      title: 'Ngày xét nghiệm',
      dataIndex: 'testDate',
      key: 'testDate',
      width: '10%'
    },
    {
      title: 'Loại xét nghiệm',
      dataIndex: 'testName',
      key: 'testName',
      width: '20%'
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: '10%',
      render: (priority) => {
        let color = 'blue'
        let text = 'Bình thường'

        if (priority === 'high') {
          color = 'orange'
          text = 'Ưu tiên cao'
        } else if (priority === 'urgent') {
          color = 'red'
          text = 'Khẩn cấp'
        }

        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => {
        let color = 'default'
        let icon = <Clock size={14} />
        let text = 'Đang chờ'

        if (status === 'processing') {
          color = 'processing'
          icon = <AlertTriangle size={14} />
          text = 'Đang xử lý'
        } else if (status === 'completed') {
          color = 'success'
          icon = <CheckCircle size={14} />
          text = 'Hoàn thành'
        }

        return (
          <Tag icon={icon} color={color}>
            {text}
          </Tag>
        )
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '25%',
      render: (_, record) => (
        <Space size='small'>
          {record.status !== 'completed' ? (
            <Button type='primary' icon={<UploadCloud size={14} />} size='small'>
              Tải kết quả
            </Button>
          ) : (
            <Button type='default' icon={<Download size={14} />} size='small'>
              Tải xuống
            </Button>
          )}
          <Button size='small'>Chi tiết</Button>
          {record.status !== 'completed' && (
            <Button size='small' type='dashed'>
              Cập nhật
            </Button>
          )}
        </Space>
      )
    }
  ]

  const tabItems = [
    {
      key: 'all',
      label: 'Tất cả kết quả',
      children: <Table columns={columns} dataSource={sampleData} rowKey='id' pagination={{ pageSize: 10 }} />
    },
    {
      key: 'pending',
      label: 'Đang chờ',
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
      key: 'processing',
      label: 'Đang xử lý',
      children: (
        <Table
          columns={columns}
          dataSource={sampleData.filter((item) => item.status === 'processing')}
          rowKey='id'
          pagination={{ pageSize: 10 }}
        />
      )
    },
    {
      key: 'completed',
      label: 'Hoàn thành',
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
          <Title level={2}>Quản lý kết quả xét nghiệm</Title>
          <Text type='secondary'>Quản lý và cập nhật kết quả xét nghiệm cho khách hàng</Text>
        </div>
        <Button type='primary' icon={<FilePlus2 size={16} />}>
          Tạo kết quả mới
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
        <Tabs defaultActiveKey='all' items={tabItems} />
      </Card>

      <div className='mt-6 text-center text-gray-500'>
        <Text type='secondary'>
          Đây là giao diện mẫu. Tính năng quản lý kết quả xét nghiệm sẽ được phát triển đầy đủ trong phiên bản tới.
        </Text>
      </div>
    </div>
  )
}

export default TestResultsManagement
