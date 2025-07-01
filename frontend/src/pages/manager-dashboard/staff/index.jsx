import React, { useState, useEffect } from 'react'
import { Table, Card, Space, Button, Input, Typography, Avatar, Tag, Modal, Row, Col, Statistic, message } from 'antd'
import { Search, Eye, User, Users, RefreshCw } from 'lucide-react'
import api from '../../../configs/axios'

const { Title, Text } = Typography
const { Search: SearchInput } = Input

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)

  // Fetch data from API
  const fetchStaffInfo = async () => {
    setLoading(true)
    try {
      console.log('Fetching staff information from API...')
      const response = await api.get('/api/StaffInfo')
      console.log('API Response:', response.data)

      if (response.data && Array.isArray(response.data)) {
        setStaffList(response.data)
        message.success(`Đã tải ${response.data.length} thông tin nhân viên từ hệ thống`)
      } else {
        console.error('Unexpected API response format:', response.data)
        setStaffList([])
        message.error('Dữ liệu API không đúng định dạng')
      }
    } catch (error) {
      console.error('Error fetching staff information:', error)
      console.error('Error details:', error.response?.data)
      setStaffList([])
      message.error('Không thể kết nối tới API. Vui lòng kiểm tra kết nối hoặc thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaffInfo()
  }, [])

  const showModal = (staff = null) => {
    setEditingStaff(staff)
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const handleSearch = (value) => {
    setSearchText(value)
  }

  // Filter staff based on search text
  const filteredStaff = staffList.filter(
    (item) =>
      (item.fullName && item.fullName.toLowerCase().includes(searchText.toLowerCase())) ||
      item.email.toLowerCase().includes(searchText.toLowerCase()) ||
      item.department.toLowerCase().includes(searchText.toLowerCase()) ||
      item.degree.toLowerCase().includes(searchText.toLowerCase())
  )

  // Define columns for the table
  const columns = [
    {
      title: 'Nhân viên',
      key: 'staff',
      render: (_, record) => (
        <div className='flex items-center'>
          <Avatar src={record.avatarUrl || null} size={40} className='mr-3' icon={<User size={24} />} />
          <div>
            <Text strong>{record.fullName || 'N/A'}</Text>
            <div className='text-gray-500 text-sm'>{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      filters: Array.from(new Set(staffList.map((s) => s.department))).map((dept) => ({ text: dept, value: dept })),
      onFilter: (value, record) => record.department === value
    },
    {
      title: 'Học vị',
      dataIndex: 'degree',
      key: 'degree',
      render: (degree) => <Tag color='blue'>{degree}</Tag>
    },
    {
      title: 'Số năm kinh nghiệm',
      dataIndex: 'yearOfExperience',
      key: 'yearOfExperience',
      sorter: (a, b) => a.yearOfExperience - b.yearOfExperience
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || 'Chưa cập nhật'
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <Button type='primary' size='small' icon={<Eye size={14} />} onClick={() => showModal(record)}>
            Chi tiết
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <Title level={4}>Quản lý Nhân viên</Title>
        <Space>
          <Button icon={<RefreshCw size={16} />} onClick={fetchStaffInfo}>
            Làm mới
          </Button>
          <SearchInput
            placeholder='Tìm kiếm nhân viên...'
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<Search size={16} />}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Space>
      </div>

      {/* Staff Statistics */}
      <Row gutter={16} className='mb-6'>
        <Col span={8}>
          <Card>
            <Statistic
              title='Tổng số nhân viên'
              value={staffList.length}
              valueStyle={{ color: '#1677ff' }}
              prefix={<Users size={18} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title='Số năm kinh nghiệm TB'
              value={
                staffList.length > 0
                  ? Math.round(staffList.reduce((acc, curr) => acc + curr.yearOfExperience, 0) / staffList.length)
                  : 0
              }
              suffix='năm'
              precision={0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title='Số phòng ban'
              value={new Set(staffList.map((s) => s.department)).size}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredStaff}
        rowKey='accountId'
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nhân viên`
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div className='p-4'>
              <Text strong>Tiểu sử:</Text>
              <p>{record.biography}</p>
            </div>
          )
        }}
      />

      <Modal
        title='Chi tiết nhân viên'
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key='back' onClick={handleCancel}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {editingStaff && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <div className='flex flex-col items-center mb-6'>
                <Avatar src={editingStaff.avatarUrl || null} size={100} icon={<User size={64} />} className='mb-3' />
                <Text strong className='text-xl'>
                  {editingStaff.fullName || 'N/A'}
                </Text>
                <Text className='text-gray-500'>{editingStaff.email}</Text>
              </div>

              <div className='mb-4'>
                <Text strong>ID Tài khoản:</Text>
                <div>{editingStaff.accountId}</div>
              </div>

              <div className='mb-4'>
                <Text strong>Phòng ban:</Text>
                <div>{editingStaff.department}</div>
              </div>

              <div className='mb-4'>
                <Text strong>Học vị:</Text>
                <div>
                  <Tag color='blue'>{editingStaff.degree}</Tag>
                </div>
              </div>
            </div>

            <div>
              <div className='mb-4'>
                <Text strong>Số năm kinh nghiệm:</Text>
                <div>{editingStaff.yearOfExperience} năm</div>
              </div>

              <div className='mb-4'>
                <Text strong>Số điện thoại:</Text>
                <div>{editingStaff.phone || 'Chưa cập nhật'}</div>
              </div>

              <div className='mb-4'>
                <Text strong>Ngày tạo:</Text>
                <div>
                  {editingStaff.createdAt ? new Date(editingStaff.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
              </div>

              <div>
                <Text strong>Tiểu sử:</Text>
                <p className='mt-2 text-justify'>{editingStaff.biography}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default StaffManagement
