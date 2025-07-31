import React, { useState, useEffect } from 'react'
import { Table, Card, Space, Button, Input, Typography, Avatar, Tag, Modal, Row, Col, Statistic, message } from 'antd'
import { Eye, User, RefreshCw, Search, Users } from 'lucide-react'
import api from '../../../configs/axios'
import ImageModal from '../../../components/ImageModal'

const { Title, Text } = Typography
const { Search: SearchInput } = Input

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState('')

  // Fetch data from API
  const fetchStaffInfo = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/StaffInfo')

      if (response.data && Array.isArray(response.data)) {
        setStaffList(response.data)
        message.success(`Đã tải ${response.data.length} thông tin nhân viên từ hệ thống`)
      } else {
        setStaffList([])
        message.error('Dữ liệu API không đúng định dạng')
      }
    } catch (error) {
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
      (item.phone && item.phone.toLowerCase().includes(searchText.toLowerCase())) ||
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
          <Avatar
            src={record.avatarUrl || null}
            size={40}
            className='mr-3 transition-all duration-300 hover:shadow-lg hover:scale-110 cursor-pointer border-2 border-blue-200 hover:border-blue-400'
            icon={<User size={24} />}
            onClick={() => {
              if (record.avatarUrl) {
                setSelectedImageUrl(record.avatarUrl)
                setImageModalVisible(true)
              }
            }}
          />
          <div className='transition-all duration-300 hover:translate-x-1'>
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
      onFilter: (value, record) => record.department === value,
      render: (department) => (
        <div className='transition-all duration-300 hover:font-bold hover:text-blue-600'>{department}</div>
      )
    },
    {
      title: 'Học vị',
      dataIndex: 'degree',
      key: 'degree',
      render: (degree) => (
        <Tag color='blue' className='transition-all duration-300 hover:scale-105'>
          {degree}
        </Tag>
      )
    },
    {
      title: 'Số năm kinh nghiệm',
      dataIndex: 'yearOfExperience',
      key: 'yearOfExperience',
      sorter: (a, b) => a.yearOfExperience - b.yearOfExperience,
      render: (years) => (
        <div className='transition-all duration-300 hover:font-bold hover:text-green-600'>{years} năm</div>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <div className='transition-all duration-300 hover:text-blue-600'>{phone || 'Chưa cập nhật'}</div>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <Button
            type='primary'
            size='small'
            icon={<Eye size={14} />}
            onClick={() => showModal(record)}
            className='transition-all duration-300 hover:scale-105 hover:shadow-md bg-green-500 hover:bg-green-600'
          >
            Chi tiết
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className='bg-gradient-to-br from-green-50 via-white to-green-50 p-6 rounded-lg shadow-sm min-h-screen'>
      <div className='flex justify-between items-center mb-6 bg-gradient-to-r from-green-100 to-green-50 p-4 rounded-lg shadow-sm'>
        <Title level={4} className='transition-all duration-300 hover:text-green-600 hover:translate-x-1 mb-0'>
          Tra Cứu Nhân viên
        </Title>
        <Space>
          <Button
            icon={<RefreshCw size={16} className='group-hover:rotate-180 transition-transform duration-500' />}
            onClick={fetchStaffInfo}
            className='transition-all duration-300 hover:shadow-md hover:text-green-600 hover:border-green-400 group bg-white'
          >
            Làm mới
          </Button>
          <SearchInput
            placeholder='Nhập tên, số điện thoại hoặc email'
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<Search size={16} />}
            onChange={(e) => setSearchText(e.target.value)}
            className='transition-all duration-300 hover:shadow-md'
          />
        </Space>
      </div>

      {/* Staff Statistics */}
      <Row gutter={16} className='mb-6 p-2 bg-green-50/30 rounded-lg'>
        <Col span={8}>
          <Card className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-green-400 bg-white'>
            <Statistic
              title='Tổng số nhân viên'
              value={staffList.length}
              valueStyle={{ color: '#1677ff' }}
              prefix={<Users size={18} className='text-green-500 animate-pulse' />}
              className='transition-all duration-300 hover:scale-105'
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-orange-400 bg-white'>
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
              className='transition-all duration-300 hover:scale-105'
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-purple-400 bg-white'>
            <Statistic
              title='Số phòng ban'
              value={new Set(staffList.map((s) => s.department)).size}
              valueStyle={{ color: '#722ed1' }}
              className='transition-all duration-300 hover:scale-105'
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
        className='transition-all duration-300 hover:shadow-md bg-white rounded-lg overflow-hidden border border-green-200'
        rowClassName={() => 'transition-all duration-300 hover:bg-green-50'}
        expandable={{
          expandedRowRender: (record) => (
            <div className='p-4 bg-green-50/40 rounded-md transition-all duration-300 hover:bg-green-100 border border-green-200'>
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
          <Button
            key='back'
            onClick={handleCancel}
            className='transition-all duration-300 hover:bg-green-50 hover:text-green-600 hover:border-green-400 hover:shadow-md'
          >
            Đóng
          </Button>
        ]}
        width={800}
        className='transition-all duration-500 bg-gradient-to-r from-green-50 to-emerald-50'
        bodyStyle={{ backgroundColor: '#f0fff5', borderRadius: '8px', padding: '20px' }}
      >
        {editingStaff && (
          <div className='flex flex-col'>
            {/* Centered avatar and name section */}
            <div className='flex flex-col items-center mb-6 pb-4 border-b bg-gradient-to-b from-blue-100 to-white rounded-lg p-6 shadow-sm'>
              <Avatar
                src={editingStaff.avatarUrl || null}
                size={120}
                icon={<User size={80} />}
                className='mb-4 shadow-md transition-all duration-500 hover:shadow-xl hover:scale-105 border-4 border-blue-200 hover:border-blue-400 cursor-pointer'
                onClick={() => {
                  if (editingStaff.avatarUrl) {
                    setSelectedImageUrl(editingStaff.avatarUrl)
                    setImageModalVisible(true)
                  }
                }}
              />
              <Text strong className='text-xl transition-all duration-300 hover:text-green-600'>
                {editingStaff.fullName || 'N/A'}
              </Text>
              <Text className='text-gray-500 transition-all duration-300 hover:text-gray-700'>
                {editingStaff.email}
              </Text>
              <div className='mt-2'>
                <Tag color='green' className='transition-all duration-300 hover:scale-110'>
                  {editingStaff.degree}
                </Tag>
              </div>
            </div>

            {/* Two column layout for details */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-br from-green-50 to-white rounded-lg p-4 shadow-sm mb-4'>
              <div>
                <div className='mb-4 p-2 rounded transition-all duration-300 hover:bg-green-50 hover:shadow-sm bg-green-50/30'>
                  <Text strong className='text-blue-700'>
                    ID Tài khoản:
                  </Text>
                  <div>{editingStaff.accountId}</div>
                </div>

                <div className='mb-4 p-2 rounded transition-all duration-300 hover:bg-green-50 hover:shadow-sm bg-green-100/40'>
                  <Text strong className='text-indigo-700'>
                    Phòng ban:
                  </Text>
                  <div>{editingStaff.department}</div>
                </div>

                <div className='mb-4 p-2 rounded transition-all duration-300 hover:bg-green-50 hover:shadow-sm bg-green-50/30'>
                  <Text strong className='text-green-700'>
                    Số năm kinh nghiệm:
                  </Text>
                  <div>{editingStaff.yearOfExperience} năm</div>
                </div>
              </div>

              <div>
                <div className='mb-4 p-2 rounded transition-all duration-300 hover:bg-green-50 hover:shadow-sm bg-green-200/30'>
                  <Text strong className='text-cyan-700'>
                    Số điện thoại:
                  </Text>
                  <div>{editingStaff.phone || 'Chưa cập nhật'}</div>
                </div>

                <div className='mb-4 p-2 rounded transition-all duration-300 hover:bg-green-50 hover:shadow-sm bg-green-300/30'>
                  <Text strong className='text-purple-700'>
                    Ngày tạo:
                  </Text>
                  <div>
                    {editingStaff.createdAt ? new Date(editingStaff.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Biography section - full width */}
            <div className='mt-4 pt-4 border-t p-4 rounded-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-md bg-gradient-to-r from-green-50 to-blue-50 shadow-sm'>
              <Text strong className='text-lg text-emerald-700'>
                Tiểu sử:
              </Text>
              <p className='mt-2 text-justify p-2 bg-white/70 rounded'>{editingStaff.biography}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Image Modal for avatar zooming */}
      <div style={{ position: 'relative', zIndex: 1100 }}>
        <ImageModal
          isOpen={imageModalVisible}
          onClose={() => setImageModalVisible(false)}
          imageUrl={selectedImageUrl}
          alt='Hình ảnh nhân viên'
        />
      </div>
    </div>
  )
}

export default StaffManagement
