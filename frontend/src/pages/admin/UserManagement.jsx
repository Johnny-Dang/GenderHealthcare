import React, { useState, useEffect, useCallback } from 'react'
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
  true: { label: 'Nam', value: 'male' },
  false: { label: 'Nữ', value: 'female' }
}

const UserManagement = () => {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [form] = Form.useForm()
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null })
  const [searchText, setSearchText] = useState('')
  const [lastFetched, setLastFetched] = useState(0)
  const [shouldRefresh, setShouldRefresh] = useState(false)
  const { showSuccess, showError } = useToast()

  // Tạo hàm fetchUsers với useCallback để nó không bị tạo lại khi component re-render
  const fetchUsers = useCallback(
    async (force = false) => {
      // Nếu đã fetch trong vòng 5 phút và không yêu cầu force refresh, thì không fetch lại
      const now = Date.now()
      if (!force && lastFetched && now - lastFetched < 5 * 60 * 1000 && userData.length > 0) {
        return
      }

      setLoading(true)
      try {
        const response = await api.get(`/api/accounts`)
        const formattedData = response.data.map((user, index) => ({
          key: index.toString(),
          id: user.accountId,
          name: user.fullName || (user.firstName || '') + ' ' + (user.lastName || ''),
          email: user.email,
          phone: user.phone,
          gender: GENDER_MAP[user.gender]?.label || 'N/A',
          dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth).format('DD/MM/YYYY') : 'N/A',
          createAt: moment(user.createAt).format('DD/MM/YYYY'),
          role: user.roleName,
          avatarUrl: user.avatarUrl,
          firstName: user.firstName,
          lastName: user.lastName,
          isDeleted: user.isDeleted
        }))
        setUserData(formattedData)
        setLastFetched(now)
        setShouldRefresh(false)
      } catch {
        showError('Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    },
    [lastFetched, userData.length, showError]
  )

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRefresh = () => {
    fetchUsers(true)
  }

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
            await api.put(`/api/accounts/${currentUser.id}`, {
              email: values.email,
              firstName,
              lastName,
              roleName: values.role
            })
            showSuccess('Cập nhật người dùng thành công!')
          } else {
            const response = await api.post(`/api/accounts`, {
              email: values.email,
              password: values.password || 'DefaultPassword123',
              firstName,
              lastName,
              roleName: values.role
            })
            if (response.data?.accountId) {
              showSuccess('Thêm người dùng thành công!')
            }
          }
          setIsModalVisible(false)
          form.resetFields()
          fetchUsers(true) // Force refresh sau khi thêm/sửa
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.'
          showError(errorMessage)
        }
      })
      .catch(() => {
        // Form validation failed - không cần làm gì
      })
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleDelete = (userId) => {
    setDeleteModal({ open: true, id: userId })
  }

  // Filtered data based on searchText
  const filteredData = userData.filter((user) => {
    const search = searchText.trim().toLowerCase()
    if (!search) return true
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    )
  })

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '16%'
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: '10%'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '10%'
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
      render: (date) => <span>{date || 'N/A'}</span>
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
    return <Loading />
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
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Button onClick={handleRefresh} icon={<ReloadOutlined />} className='mr-2' loading={loading}>
            Làm mới
          </Button>
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
        dataSource={filteredData}
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
          {/* Show password field only for new users */}
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
            await api.delete(`api/accounts/${deleteModal.id}`)
            showSuccess('Đã xóa (mềm) người dùng!')
            fetchUsers(true)
          } catch {
            showError('Không thể xóa người dùng. Vui lòng thử lại sau.')
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
