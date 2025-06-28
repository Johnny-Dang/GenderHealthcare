import React, { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Space,
  Button,
  Input,
  Typography,
  Badge,
  Avatar,
  Tag,
  Modal,
  Form,
  Select,
  Row,
  Col,
  Statistic,
  Divider,
  message
} from 'antd'
import { Search, UserPlus, Edit, Trash2, User, Mail, Phone, Calendar, MapPin, Briefcase, Check } from 'lucide-react'

const { Title, Text } = Typography
const { Search: SearchInput } = Input
const { Option } = Select

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [form] = Form.useForm()

  // Mock data for demonstration
  useEffect(() => {
    // In a real application, you'd fetch this from your API
    const mockStaff = [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0987654321',
        role: 'Bác sĩ',
        department: 'Khoa Nội',
        status: 'active',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        address: 'Hà Nội',
        hireDate: '2020-05-12',
        specialization: 'Nội tiết'
      },
      {
        id: 2,
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        phone: '0912345678',
        role: 'Y tá',
        department: 'Khoa Nội',
        status: 'active',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        address: 'Hồ Chí Minh',
        hireDate: '2021-02-15',
        specialization: 'Chăm sóc hậu phẫu'
      },
      {
        id: 3,
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0978123456',
        role: 'Bác sĩ',
        department: 'Khoa Ngoại',
        status: 'on_leave',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
        address: 'Đà Nẵng',
        hireDate: '2019-11-01',
        specialization: 'Phẫu thuật tổng quát'
      },
      {
        id: 4,
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        phone: '0934567890',
        role: 'Y tá',
        department: 'Khoa Nhi',
        status: 'active',
        avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
        address: 'Hải Phòng',
        hireDate: '2022-01-10',
        specialization: 'Chăm sóc trẻ sơ sinh'
      },
      {
        id: 5,
        name: 'Hoàng Văn E',
        email: 'hoangvane@example.com',
        phone: '0945678901',
        role: 'Kỹ thuật viên',
        department: 'Khoa Xét nghiệm',
        status: 'inactive',
        avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
        address: 'Cần Thơ',
        hireDate: '2020-08-20',
        specialization: 'Xét nghiệm máu'
      }
    ]

    setStaffList(mockStaff)
    setLoading(false)
  }, [])

  const showModal = (staff = null) => {
    setEditingStaff(staff)
    if (staff) {
      form.setFieldsValue(staff)
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleSubmit = (values) => {
    if (editingStaff) {
      // Update existing staff
      setStaffList(staffList.map((staff) => (staff.id === editingStaff.id ? { ...staff, ...values } : staff)))
    } else {
      // Add new staff
      const newStaff = {
        ...values,
        id: Math.max(...staffList.map((s) => s.id)) + 1,
        avatar: 'https://randomuser.me/api/portraits/men/85.jpg' // Default avatar
      }
      setStaffList([...staffList, newStaff])
    }
    setIsModalVisible(false)
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xoá',
      content: 'Bạn có chắc chắn muốn xoá nhân viên này không?',
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk() {
        setStaffList(staffList.filter((staff) => staff.id !== id))
        message.success('Đã xoá nhân viên thành công')
      }
    })
  }

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const filteredStaff = staffList.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email.toLowerCase().includes(searchText.toLowerCase()) ||
      item.role.toLowerCase().includes(searchText.toLowerCase()) ||
      item.department.toLowerCase().includes(searchText.toLowerCase())
  )

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge status='success' text='Đang làm việc' />
      case 'on_leave':
        return <Badge status='warning' text='Nghỉ phép' />
      case 'inactive':
        return <Badge status='error' text='Không hoạt động' />
      default:
        return <Badge status='default' text='Không xác định' />
    }
  }

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className='flex items-center'>
          <Avatar src={record.avatar} size={40} className='mr-3' />
          <div>
            <Text strong>{record.name}</Text>
            <div className='text-gray-500 text-sm'>{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Chức vụ',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color={role === 'Bác sĩ' ? 'blue' : role === 'Y tá' ? 'green' : 'orange'}>{role}</Tag>,
      filters: [
        { text: 'Bác sĩ', value: 'Bác sĩ' },
        { text: 'Y tá', value: 'Y tá' },
        { text: 'Kỹ thuật viên', value: 'Kỹ thuật viên' }
      ],
      onFilter: (value, record) => record.role === value
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      filters: [
        { text: 'Khoa Nội', value: 'Khoa Nội' },
        { text: 'Khoa Ngoại', value: 'Khoa Ngoại' },
        { text: 'Khoa Nhi', value: 'Khoa Nhi' },
        { text: 'Khoa Xét nghiệm', value: 'Khoa Xét nghiệm' }
      ],
      onFilter: (value, record) => record.department === value
    },
    {
      title: 'Chuyên môn',
      dataIndex: 'specialization',
      key: 'specialization',
      ellipsis: true
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status),
      filters: [
        { text: 'Đang làm việc', value: 'active' },
        { text: 'Nghỉ phép', value: 'on_leave' },
        { text: 'Không hoạt động', value: 'inactive' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <Button type='primary' size='small' icon={<Edit size={14} />} onClick={() => showModal(record)}>
            Sửa
          </Button>
          <Button danger size='small' icon={<Trash2 size={14} />} onClick={() => handleDelete(record.id)}>
            Xoá
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
          <SearchInput
            placeholder='Tìm kiếm nhân viên...'
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<Search size={16} />}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type='primary' icon={<UserPlus size={16} />} onClick={() => showModal()}>
            Thêm nhân viên
          </Button>
        </Space>
      </div>

      {/* Staff Statistics */}
      <Row gutter={16} className='mb-6'>
        <Col span={6}>
          <Card>
            <Statistic
              title='Tổng số nhân viên'
              value={staffList.length}
              valueStyle={{ color: '#1677ff' }}
              prefix={<User size={18} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Đang làm việc'
              value={staffList.filter((s) => s.status === 'active').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<Check size={18} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Số bác sĩ'
              value={staffList.filter((s) => s.role === 'Bác sĩ').length}
              valueStyle={{ color: '#722ed1' }}
              prefix={<Briefcase size={18} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Số y tá'
              value={staffList.filter((s) => s.role === 'Y tá').length}
              valueStyle={{ color: '#eb2f96' }}
              prefix={<Briefcase size={18} />}
            />
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredStaff}
        rowKey='id'
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nhân viên`
        }}
      />

      <Modal
        title={editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name='name' label='Họ và tên' rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                <Input prefix={<User size={16} />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='email'
                label='Email'
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input prefix={<Mail size={16} />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='phone'
                label='Số điện thoại'
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input prefix={<Phone size={16} />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='role' label='Chức vụ' rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}>
                <Select>
                  <Option value='Bác sĩ'>Bác sĩ</Option>
                  <Option value='Y tá'>Y tá</Option>
                  <Option value='Kỹ thuật viên'>Kỹ thuật viên</Option>
                  <Option value='Hành chính'>Hành chính</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='department'
                label='Phòng ban'
                rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}
              >
                <Select>
                  <Option value='Khoa Nội'>Khoa Nội</Option>
                  <Option value='Khoa Ngoại'>Khoa Ngoại</Option>
                  <Option value='Khoa Nhi'>Khoa Nhi</Option>
                  <Option value='Khoa Xét nghiệm'>Khoa Xét nghiệm</Option>
                  <Option value='Hành chính'>Hành chính</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='status'
                label='Trạng thái'
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              >
                <Select>
                  <Option value='active'>Đang làm việc</Option>
                  <Option value='on_leave'>Nghỉ phép</Option>
                  <Option value='inactive'>Không hoạt động</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name='address' label='Địa chỉ'>
                <Input prefix={<MapPin size={16} />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='hireDate' label='Ngày tuyển dụng'>
                <Input prefix={<Calendar size={16} />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name='specialization' label='Chuyên môn'>
            <Input />
          </Form.Item>

          <Divider />

          <div className='flex justify-end'>
            <Button className='mr-2' onClick={handleCancel}>
              Huỷ
            </Button>
            <Button type='primary' htmlType='submit'>
              {editingStaff ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default StaffManagement
