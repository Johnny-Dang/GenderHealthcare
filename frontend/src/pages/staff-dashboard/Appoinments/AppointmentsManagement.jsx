import React, { useState, useEffect } from 'react'
import { Typography, Table, Card, Button, Tag, Badge, Space, Select, message, Modal, Spin, Empty } from 'antd'
import { CheckCircle, XCircle, AlertTriangle, Clock, RefreshCw, FileText, Search } from 'lucide-react'
import api from '@/configs/axios'
import { format } from 'date-fns'

const { Title, Text } = Typography
const { Option } = Select

const AppointmentsManagement = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  // Fetch all services for filter
  const fetchServices = async () => {
    try {
      const response = await api.get('/api/services')
      setServices(
        response.data.map((service) => ({
          id: service.serviceId,
          name: service.serviceName
        }))
      )
    } catch (error) {
      message.error('Không thể tải danh sách dịch vụ')
    }
  }

  // Fetch appointments by service
  const fetchAppointments = async (serviceId = selectedService) => {
    if (!serviceId) {
      setAppointments([])
      return
    }
    setLoading(true)
    try {
      const endpoint = `/api/booking-details/service/${serviceId}`
      const response = await api.get(endpoint)
      const formattedData = response.data.map((item) => ({
        id: item.bookingDetailId,
        bookingId: item.bookingId,
        customerName: `${item.firstName} ${item.lastName}`,
        date: item.slotDate,
        time: item.slotShift === 'AM' ? '08:00 - 12:00' : '13:00 - 17:00',
        shift: item.slotShift,
        testServices: [item.serviceName],
        serviceId: item.serviceId,
        status: mapStatusToValue(item.status),
        statusText: item.status,
        phone: item.phone,
        gender: item.gender ? 'Nam' : 'Nữ',
        dateOfBirth: item.dateOfBirth
      }))
      setAppointments(formattedData)
    } catch (error) {
      message.error('Không thể tải danh sách lịch hẹn')
    } finally {
      setLoading(false)
    }
  }

  // Map status from API to our internal status values
  const mapStatusToValue = (status) => {
    switch (status?.toLowerCase()) {
      case 'hoàn thành':
      case 'đã có kết quả':
        return 'completed'
      case 'đã xét nghiệm':
        return 'tested'
      case 'chờ xét nghiệm':
      case 'chưa xét nghiệm':
      case 'đang chờ':
      default:
        return 'pending'
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    if (selectedService) fetchAppointments(selectedService)
    else setAppointments([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService])

  // Search filter (by name or phone)
  const getFilteredData = (data) => {
    if (!searchTerm) return data
    const term = searchTerm.toLowerCase()
    return data.filter(
      (item) => item.customerName.toLowerCase().includes(term) || item.phone.toLowerCase().includes(term)
    )
  }

  // Confirm appointment
  const handleConfirmAppointment = async () => {
    if (!selectedAppointment) return
    setConfirmLoading(true)
    try {
      await api.put(`/api/booking-details/${selectedAppointment.id}/confirm`)
      message.success('Đã xác nhận xét nghiệm thành công')
      setConfirmModalVisible(false)
      if (selectedService) fetchAppointments(selectedService)
    } catch (error) {
      message.error('Không thể xác nhận xét nghiệm')
    } finally {
      setConfirmLoading(false)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id) => <span className='font-mono'>{id.substring(0, 8) + '...'}</span>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 180,
      render: (text, record) => (
        <div>
          <span className='font-medium'>{text}</span>
          <div className='text-xs text-gray-500'>{record.phone}</div>
        </div>
      )
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date, record) => (
        <div>
          <span>{format(new Date(date), 'dd/MM/yyyy')}</span>
          <div className='text-xs text-gray-500'>{record.shift === 'AM' ? 'Sáng' : 'Chiều'}</div>
        </div>
      )
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'testServices',
      key: 'testServices',
      width: 180,
      render: (services) => (
        <Tag color='blue' className='font-medium'>
          {services[0]}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      filters: [
        { text: 'Đang chờ', value: 'pending' },
        { text: 'Đã xét nghiệm', value: 'tested' },
        { text: 'Đã có kết quả', value: 'completed' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status, record) => {
        let color = 'default'
        let icon = <Clock size={14} />
        let text = 'Đang chờ'
        if (status === 'tested') {
          color = 'warning'
          icon = <AlertTriangle size={14} />
          text = 'Đã xét nghiệm'
        } else if (status === 'completed') {
          color = 'success'
          icon = <CheckCircle size={14} />
          text = 'Đã có kết quả'
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
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size='small'>
          {record.status === 'pending' ? (
            <Button
              type='primary'
              className='bg-green-600 hover:bg-green-700 text-white'
              icon={<CheckCircle size={16} />}
              onClick={() => {
                setSelectedAppointment(record)
                setConfirmModalVisible(true)
              }}
            >
              Xác nhận đã xét nghiệm
            </Button>
          ) : (
            <Button disabled>Không có thao tác</Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      <Card className='shadow-lg border-0 mb-8'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <Title level={2} className='!mb-1 gradient-text'>
              Quản lý lịch hẹn xét nghiệm
            </Title>
            <Text type='secondary'>Quản lý và theo dõi các lịch hẹn xét nghiệm của khách hàng</Text>
          </div>
          <Button
            type='primary'
            icon={<RefreshCw size={18} />}
            onClick={() => {
              if (selectedService) fetchAppointments(selectedService)
            }}
            className='bg-blue-600 hover:bg-blue-700'
          >
            Làm mới dữ liệu
          </Button>
        </div>
        <div className='mt-6 flex flex-col md:flex-row gap-4'>
          <div className='flex-1 min-w-[200px]'>
            <label className='block text-sm font-medium mb-2'>Chọn dịch vụ xét nghiệm:</label>
            <Select
              placeholder='Chọn dịch vụ xét nghiệm'
              style={{ width: '100%' }}
              loading={services.length === 0}
              onChange={setSelectedService}
              allowClear
              onClear={() => {
                setSelectedService(null)
                setAppointments([])
              }}
              size='large'
              value={selectedService}
            >
              {services.map((service) => (
                <Option key={service.id} value={service.id}>
                  {service.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className='flex-1 min-w-[200px] md:order-2'>
            <label className='block text-sm font-medium mb-2'>Tìm kiếm theo tên hoặc số điện thoại:</label>
            <div className='flex gap-2'>
              <input
                type='text'
                placeholder='Nhập tên hoặc số điện thoại...'
                className='w-full p-2 border border-gray-300 rounded'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button icon={<Search size={16} />} />
            </div>
          </div>
        </div>
      </Card>

      <Card className='border-0 shadow-md'>
        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <Spin size='large' tip='Đang tải dữ liệu...' />
          </div>
        ) : !selectedService ? (
          <div className='text-center py-12'>
            <FileText size={64} className='mx-auto text-gray-300 mb-4' />
            <Text type='secondary' className='text-lg'>
              Vui lòng chọn một dịch vụ xét nghiệm
            </Text>
          </div>
        ) : appointments.length > 0 ? (
          <>
            <div className='flex justify-between mb-4 items-center'>
              <Text className='text-base'>
                Tổng số: <strong>{appointments.length}</strong> lịch hẹn
              </Text>
              <div className='flex flex-wrap gap-2'>
                <Text strong className='mr-1'>
                  Trạng thái:
                </Text>
                <Tag color='default'>Đang chờ: {appointments.filter((item) => item.status === 'pending').length}</Tag>
                <Tag color='warning'>
                  Đã xét nghiệm: {appointments.filter((item) => item.status === 'tested').length}
                </Tag>
                <Tag color='success'>
                  Đã có kết quả: {appointments.filter((item) => item.status === 'completed').length}
                </Tag>
              </div>
            </div>
            <Table
              columns={columns}
              dataSource={getFilteredData(appointments)}
              rowKey='id'
              pagination={{ pageSize: 10 }}
              bordered
              className='rounded-lg shadow'
            />
          </>
        ) : (
          <Empty description='Không có dữ liệu lịch hẹn cho dịch vụ này' image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* Confirm Modal */}
      <Modal
        title={
          <span className='font-bold flex items-center gap-2'>
            <CheckCircle className='text-green-500' /> Xác nhận đã xét nghiệm
          </span>
        }
        open={confirmModalVisible}
        onOk={handleConfirmAppointment}
        onCancel={() => setConfirmModalVisible(false)}
        okText='Xác nhận'
        cancelText='Hủy'
        confirmLoading={confirmLoading}
        centered
      >
        <div className='space-y-2'>
          <p>Bạn xác nhận đã tiến hành xét nghiệm cho khách hàng này?</p>
          {selectedAppointment && (
            <div className='mt-2 p-4 bg-gray-50 rounded-lg border'>
              <p>
                <strong>Khách hàng:</strong> {selectedAppointment.customerName}
              </p>
              <p>
                <strong>Dịch vụ:</strong> {selectedAppointment.testServices.join(', ')}
              </p>
              <p>
                <strong>Ngày hẹn:</strong> {format(new Date(selectedAppointment.date), 'dd/MM/yyyy')}
              </p>
              <p className='mb-0'>
                <strong>Ca:</strong> {selectedAppointment.shift === 'AM' ? 'Sáng' : 'Chiều'}
              </p>
            </div>
          )}
          <div className='pt-2'>
            <span className='flex items-center text-green-600 text-sm'>
              <CheckCircle size={16} className='mr-1' />
              Sau khi xác nhận, trạng thái lịch hẹn sẽ chuyển sang <b>"Đã xét nghiệm"</b>.
            </span>
            <span className='flex items-center text-gray-500 text-xs mt-1'>
              <AlertTriangle size={14} className='mr-1 text-amber-500' />
              Sau khi xét nghiệm, bạn có thể tải lên kết quả ở trang "Quản lý kết quả xét nghiệm".
            </span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AppointmentsManagement
