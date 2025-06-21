import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Spin, Modal, Form, Input, Select, Typography, Divider, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons'
import moment from 'moment'
import api from '../../configs/axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const { Option } = Select
const { Title, Text } = Typography

const UserManagement = () => {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [form] = Form.useForm()
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get(`api/users`)
      const formattedData = response.data.map((user, index) => ({
        key: index.toString(),
        id: user.accountId,
        name: user.fullName || (user.firstName || '') + ' ' + (user.lastName || ''),
        email: user.email,
        phone: user.phone,
        gender: user.gender ? 'Nam' : 'Nữ',
        dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth).format('DD/MM/YYYY') : 'N/A',
        createAt: moment(user.createAt).format('DD/MM/YYYY'),
        role: user.roleName,
        avatarUrl: user.avatarUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        isDeleted: user.isDeleted
      }))
      setUserData(formattedData)
      setLoading(false)
    } catch {
      setLoading(false)
      toast.error('Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const showModal = (user = null) => {
    setCurrentUser(user)
    if (user) {
      form.setFieldsValue(user)
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          let firstName = '',
            lastName = ''
          if (values.name) {
            const parts = values.name.trim().split(' ')
            lastName = parts.pop()
            firstName = parts.join(' ')
          }
          if (currentUser) {
            // Cập nhật thông tin người dùng
            await api.put(`api/users/${currentUser.id}`, {
              email: values.email,
              firstName,
              lastName,
              roleName: values.role
            })
            toast.success('Cập nhật người dùng thành công!')
          } else {
            // Tạo người dùng mới
            const response = await api.post(`api/users`, {
              email: values.email,
              password: values.password || 'DefaultPassword123',
              firstName,
              lastName,
              roleName: values.role
            })
            if (response.data && response.data.accountId) {
              toast.success('Thêm người dùng thành công!')
            }
          }
          setIsModalVisible(false)
          form.resetFields()
          fetchUsers()
        } catch {
          toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.')
        }
      })
      .catch(() => {
        // Không cần toast ở đây
      })
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleDelete = (userId) => {
    console.log('Xóa người dùng với ID:', userId)

    setDeleteModal({ open: true, id: userId })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '18%'
    },
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
      key: 'email',
      width: '20%'
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: '12%'
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: '10%',
      filters: [
        { text: 'Nam', value: 'Nam' },
        { text: 'Nữ', value: 'Nữ' }
      ],
      onFilter: (value, record) => record.gender === value
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      width: '12%',
      render: (date) => <span>{date ? formatDate(date) : 'N/A'}</span>
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'blue'
        if (role === 'Admin') color = 'pink'
        else if (role === 'Consultant') color = 'geekblue'
        else if (role === 'Manager') color = 'gold'
        else if (role === 'Staff') color = 'purple'
        else if (role === 'User') color = 'blue'
        return (
          <Tag color={color} className='px-3 py-1 rounded-full'>
            {role}
          </Tag>
        )
      },
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'Consultant', value: 'Consultant' },
        { text: 'Manager', value: 'Manager' },
        { text: 'Staff', value: 'Staff' },
        { text: 'User', value: 'User' }
      ],
      onFilter: (value, record) => record.role === value
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      key: 'isDeleted',
      width: '10%',
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
      width: '12%',
      render: (_, record) => (
        <Space size='middle'>
          <Button
            type='primary'
            ghost
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            className='border-pink-500 text-pink-500 hover:border-pink-700 hover:text-pink-700'
          />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ]

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Spin size='large' tip='Đang tải...' />
      </div>
    )
  }

  return (
    <>
      <ToastContainer />
      <div className='mb-6'>
        <Title level={3} className='text-gray-800 mb-1'>
          Quản lý người dùng
        </Title>
        <Text type='secondary'>Quản lý thông tin và phân quyền của người dùng trong hệ thống</Text>
        <Divider className='mt-4 mb-6' />
      </div>

      <div className='flex justify-between items-center mb-5'>
        <div className='flex items-center'>
          <Input
            placeholder='Tìm kiếm người dùng...'
            prefix={<SearchOutlined className='text-gray-400' />}
            className='w-64 mr-4'
          />
        </div>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          className='bg-gradient-to-r from-pink-500 to-pink-600 border-none hover:from-pink-600 hover:to-pink-700 shadow-md'
        >
          Thêm người dùng
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={userData}
        rowClassName='hover:bg-pink-50'
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng cộng ${total} người dùng`
        }}
        className='rounded-lg overflow-hidden shadow-md'
      />

      <Modal
        title={
          <div className='flex items-center'>
            <UserOutlined className='text-pink-500 mr-2 text-xl' />
            <span>{currentUser ? 'Sửa thông tin người dùng' : 'Thêm người dùng mới'}</span>
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{
          className: 'bg-gradient-to-r from-pink-500 to-pink-600 border-none hover:from-pink-600 hover:to-pink-700'
        }}
        centered
        maskClosable={false}
      >
        <Form form={form} layout='vertical' name='userForm' className='pt-4'>
          <Form.Item name='name' label='Tên' rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder='Nhập họ và tên người dùng' />
          </Form.Item>
          <Form.Item
            name='email'
            label='Email'
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder='Nhập địa chỉ email' />
          </Form.Item>
          <Form.Item name='role' label='Vai trò' rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}>
            <Select placeholder='Chọn vai trò'>
              <Option value='Admin'>Admin</Option>
              <Option value='Consultant'>Consultant</Option>
              <Option value='Manager'>Manager</Option>
              <Option value='Staff'>Staff</Option>
              <Option value='User'>User</Option>
            </Select>
          </Form.Item>
          {/* Nếu là tạo mới thì cho nhập password */}
          {!currentUser && (
            <Form.Item name='password' label='Mật khẩu'>
              <Input.Password placeholder='Nhập mật khẩu (mặc định: DefaultPassword123)' />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        open={deleteModal.open}
        onOk={async () => {
          try {
            await api.delete(`api/users/${deleteModal.id}`)
            toast.success('Đã xóa (mềm) người dùng!')
            fetchUsers()
          } catch {
            toast.error('Không thể xóa người dùng. Vui lòng thử lại sau.')
          }
          setDeleteModal({ open: false, id: null })
        }}
        onCancel={() => setDeleteModal({ open: false, id: null })}
        okText='Xóa'
        okType='danger'
        cancelText='Hủy'
      >
        Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
      </Modal>
    </>
  )
}

export default UserManagement
