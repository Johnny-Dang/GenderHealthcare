import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Spin, Modal, Form, Input, Select, message, Typography, Badge, Divider, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons'

const { Option } = Select
const { Title, Text } = Typography

const UserManagement = () => {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    // NOTE: API call cần thực hiện ở đây
    // Cần gọi API để lấy danh sách người dùng
    // API: GET /api/users

    // Mô phỏng việc gọi API
    const fetchUsers = async () => {
      try {
        // Thay thế bằng API call thực tế
        // const response = await axios.get('/api/users');
        // setUserData(response.data);

        // Dữ liệu mẫu
        setTimeout(() => {
          setUserData([
            {
              key: '1',
              id: '1',
              name: 'Nguyễn Văn A',
              email: 'nguyenvana@example.com',
              role: 'User',
              status: 'Active'
            },
            {
              key: '2',
              id: '2',
              name: 'Trần Thị B',
              email: 'tranthib@example.com',
              role: 'Admin',
              status: 'Active'
            },
            {
              key: '3',
              id: '3',
              name: 'Lê Văn C',
              email: 'levanc@example.com',
              role: 'User',
              status: 'Inactive'
            }
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error)
        setLoading(false)
      }
    }

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
      .then((values) => {
        if (currentUser) {
          // NOTE: API call cần thực hiện ở đây
          // Cần gọi API để cập nhật thông tin người dùng
          // API: PUT /api/users/:id
          // Body: values

          message.success('Cập nhật người dùng thành công!')
        } else {
          // NOTE: API call cần thực hiện ở đây
          // Cần gọi API để tạo người dùng mới
          // API: POST /api/users
          // Body: values

          message.success('Thêm người dùng thành công!')
        }

        setIsModalVisible(false)
        form.resetFields()

        // Sau khi thêm/cập nhật, gọi lại API lấy danh sách người dùng
      })
      .catch((info) => {
        console.log('Validation Failed:', info)
      })
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleDelete = (userId) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa người dùng này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        // NOTE: API call cần thực hiện ở đây
        // Cần gọi API để xóa người dùng
        // API: DELETE /api/users/:id

        message.success('Xóa người dùng thành công!')

        // Sau khi xóa, cập nhật lại danh sách người dùng
        setUserData((prevData) => prevData.filter((user) => user.id !== userId))
      }
    })
  }

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return (
        <Tag color='success' className='px-3 py-1 rounded-full'>
          Active
        </Tag>
      )
    } else {
      return (
        <Tag color='error' className='px-3 py-1 rounded-full'>
          Inactive
        </Tag>
      )
    }
  }

  const getRoleBadge = (role) => {
    if (role === 'Admin') {
      return (
        <Tag color='pink' className='px-3 py-1 rounded-full'>
          Admin
        </Tag>
      )
    } else {
      return (
        <Tag color='blue' className='px-3 py-1 rounded-full'>
          User
        </Tag>
      )
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '10%'
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getRoleBadge(role),
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'User', value: 'User' }
      ],
      onFilter: (value, record) => record.role === value
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status),
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Hành động',
      key: 'action',
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
            <Input placeholder='Nhập tên người dùng' />
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
              <Option value='User'>User</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name='status'
            label='Trạng thái'
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder='Chọn trạng thái'>
              <Option value='Active'>Active</Option>
              <Option value='Inactive'>Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default UserManagement
