import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, Select, Typography, Divider, Tag } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import moment from 'moment'
import api from '../../configs/axios'
import { useToast } from '@/hooks/useToast'
import Loading from '../../components/Loading'

const { Option } = Select
const { Title, Text } = Typography

const GENDER_MAP = {
  true: { label: 'Nam' },
  false: { label: 'Nữ' }
}

const UserManagement = () => {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [form] = Form.useForm()
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null })
  const [searchText, setSearchText] = useState('')
  const { showSuccess, showError } = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/accounts')
      const formattedData = response.data.map((user) => ({
        key: user.accountId,
        id: user.accountId,
        name: user.fullName || 'Chưa cập nhật',
        email: user.email,
        phone: user.phone || 'Chưa cập nhật',
        gender: GENDER_MAP[user.gender]?.label || 'Chưa xác định',
        dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth).format('DD/MM/YYYY') : 'Chưa cập nhật',
        createAt: moment(user.createAt).format('DD/MM/YYYY'),
        role: user.roleName,
        isDeleted: user.isDeleted
      }))
      setUserData(formattedData)
    } catch {
      showError('Không thể tải dữ liệu người dùng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const showModal = (user = null) => {
    setCurrentUser(user)
    if (user) {
      form.setFieldsValue({
        name: user.name === 'Chưa cập nhật' ? '' : user.name,
        email: user.email,
        role: user.role
      })
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        email: values.email,
        fullName: values.name,
        roleName: values.role
      }

      if (currentUser) {
        await api.put(`/api/accounts/${currentUser.id}`, payload)
        showSuccess('Cập nhật thành công!')
      } else {
        await api.post('/api/accounts', {
          ...payload,
          password: values.password || 'Hashedpassword'
        })
        showSuccess('Thêm người dùng thành công!')
      }

      setIsModalVisible(false)
      form.resetFields()
      fetchUsers()
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setCurrentUser(null)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/api/accounts/${deleteModal.id}`)
      showSuccess('Đã xóa người dùng!')
      fetchUsers()
    } catch {
      showError('Không thể xóa người dùng')
    }
    setDeleteModal({ open: false, id: null })
  }

  const filteredData = userData.filter((user) => {
    const search = searchText.toLowerCase()
    return (
      !search ||
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    )
  })

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      filters: [
        { text: 'Nam', value: 'Nam' },
        { text: 'Nữ', value: 'Nữ' }
      ],
      onFilter: (value, record) => record.gender === value
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colors = {
          Admin: 'red',
          Manager: 'blue',
          Staff: 'green',
          Consultant: 'purple',
          User: 'default'
        }
        return <Tag color={colors[role]}>{role}</Tag>
      },
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'Manager', value: 'Manager' },
        { text: 'Staff', value: 'Staff' },
        { text: 'Consultant', value: 'Consultant' },
        { text: 'User', value: 'User' }
      ],
      onFilter: (value, record) => record.role === value
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      key: 'isDeleted',
      render: (isDeleted) => <Tag color={isDeleted ? 'red' : 'green'}>{isDeleted ? 'Đã xóa' : 'Hoạt động'}</Tag>,
      filters: [
        { text: 'Hoạt động', value: false },
        { text: 'Đã xóa', value: true }
      ],
      onFilter: (value, record) => record.isDeleted === value
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => {
        const isAdmin = record.role === 'Admin'
        return (
          <Space>
            {!isAdmin && <Button type='primary' ghost icon={<EditOutlined />} onClick={() => showModal(record)} />}
            {!isAdmin && (
              <Button danger icon={<DeleteOutlined />} onClick={() => setDeleteModal({ open: true, id: record.id })} />
            )}
            {isAdmin && <Text type='secondary'>Bảo vệ</Text>}
          </Space>
        )
      }
    }
  ]

  if (loading) return <Loading />

  return (
    <>
      <div className='mb-6'>
        <Title level={3}>Quản lý người dùng</Title>
        <Text type='secondary'>Quản lý thông tin và phân quyền của người dùng trong hệ thống</Text>
        <Divider />
      </div>

      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center gap-3'>
          <Input
            placeholder='Tìm kiếm...'
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className='w-64'
          />
          <Button onClick={fetchUsers} icon={<ReloadOutlined />} loading={loading} size='sm'>
            Làm mới
          </Button>
        </div>
        <Button
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          className='bg-gradient-primary hover:opacity-90 text-white border-none'
          size='sm'
        >
          Thêm người dùng
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng: ${total} người dùng`
        }}
        className='shadow-md'
      />

      <Modal
        title={
          <div className='flex items-center gap-2'>
            <UserOutlined />
            <span>{currentUser ? 'Sửa người dùng' : 'Thêm người dùng'}</span>
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        okButtonProps={{
          className: 'bg-gradient-primary hover:opacity-90 text-white border-none'
        }}
      >
        <Form form={form} layout='vertical' className='pt-4'>
          <Form.Item name='name' label='Họ tên' rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder='Nhập họ và tên' />
          </Form.Item>

          <Form.Item
            name='email'
            label='Email'
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder='Nhập email' />
          </Form.Item>

          <Form.Item name='role' label='Vai trò' rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}>
            <Select placeholder='Chọn vai trò'>
              <Option value='Manager'>Manager</Option>
              <Option value='Staff'>Staff</Option>
              <Option value='Consultant'>Consultant</Option>
              <Option value='User'>User</Option>
            </Select>
          </Form.Item>

          {!currentUser && (
            <Form.Item name='password' label='Mật khẩu'>
              <Input.Password placeholder='Mặc định: Hashedpassword' />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title='Xác nhận xóa'
        open={deleteModal.open}
        onOk={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null })}
        okText='Xóa'
        okType='danger'
        cancelText='Hủy'
      >
        Bạn có chắc chắn muốn xóa người dùng này?
      </Modal>
    </>
  )
}

export default UserManagement
