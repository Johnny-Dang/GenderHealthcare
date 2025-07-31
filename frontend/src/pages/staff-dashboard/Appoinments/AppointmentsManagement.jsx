import React, { useState, useEffect } from 'react'
import { Typography, Table, Card, Button, Tag, Space, Select, message, Modal, Spin, Empty, Input } from 'antd'
import { CheckCircle, AlertTriangle, Clock, RefreshCw, Calendar, Search } from 'lucide-react'
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

  const fetchAppointments = async (serviceId = null) => {
    setLoading(true)
    try {
      let endpoint = '/api/booking-details'
      const params = new URLSearchParams()
      params.append('status', 'Chưa xét nghiệm')

      if (serviceId) {
        endpoint = `/api/booking-details/service/${serviceId}`
      }

      const response = await api.get(`${endpoint}?${params.toString()}`)
      const formattedData = response.data.map((item) => ({
        id: item.bookingDetailId,
        customerName: `${item.firstName} ${item.lastName}`,
        date: item.slotDate,
        shift: item.slotShift,
        serviceName: item.serviceName,
        phone: item.phone
      }))
      setAppointments(formattedData)
    } catch (error) {
      message.error('Không thể tải danh sách lịch hẹn')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
    fetchAppointments()
  }, [])

  const filteredAppointments = appointments.filter((item) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return item.customerName.toLowerCase().includes(term) || item.phone.includes(term)
  })

  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId)
    fetchAppointments(serviceId)
  }

  const handleConfirmAppointment = async () => {
    if (!selectedAppointment) return
    setConfirmLoading(true)
    try {
      await api.put(`/api/booking-details/${selectedAppointment.id}/confirm`)
      message.success('Đã xác nhận xét nghiệm thành công')
      setConfirmModalVisible(false)
      fetchAppointments(selectedService)
    } catch (error) {
      message.error('Không thể xác nhận xét nghiệm')
    } finally {
      setConfirmLoading(false)
    }
  }

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <div>
          <div className='font-medium'>{text}</div>
          <div className='text-xs text-gray-500'>{record.phone}</div>
        </div>
      )
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'date',
      key: 'date',
      render: (date, record) => (
        <div>
          <div>{format(new Date(date), 'dd/MM/yyyy')}</div>
          <div className='text-xs text-gray-500'>{record.shift === 'AM' ? 'Sáng' : 'Chiều'}</div>
        </div>
      )
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName',
      render: (service) => <Tag color='blue'>{service}</Tag>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: () => (
        <Tag icon={<Clock size={14} />} color='warning'>
          Chưa xét nghiệm
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type='primary'
          icon={<CheckCircle size={16} />}
          onClick={() => {
            setSelectedAppointment(record)
            setConfirmModalVisible(true)
          }}
        >
          Xác nhận đã xét nghiệm
        </Button>
      )
    }
  ]

  return (
    <div className='p-6'>
      <Card className='mb-6'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <Title level={3} className='mb-1 flex items-center gap-2'>
              <Calendar size={24} />
              Quản lý lịch hẹn xét nghiệm
            </Title>
            <Text type='secondary'>Quản lý các lịch hẹn chưa xét nghiệm</Text>
          </div>
          <Button type='primary' icon={<RefreshCw size={16} />} onClick={() => fetchAppointments(selectedService)}>
            Làm mới
          </Button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Dịch vụ:</label>
            <Select
              placeholder='Tất cả dịch vụ'
              style={{ width: '100%' }}
              onChange={handleServiceChange}
              allowClear
              value={selectedService}
            >
              {services.map((service) => (
                <Option key={service.id} value={service.id}>
                  {service.name}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Tìm kiếm:</label>
            <Input
              placeholder='Tên hoặc số điện thoại...'
              prefix={<Search size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className='text-center py-12'>
            <Spin size='large' tip='Đang tải dữ liệu...' />
          </div>
        ) : filteredAppointments.length > 0 ? (
          <>
            <div className='mb-4'>
              <Text>
                Tổng số: <strong>{filteredAppointments.length}</strong> lịch hẹn chưa xét nghiệm
              </Text>
            </div>
            <Table columns={columns} dataSource={filteredAppointments} rowKey='id' pagination={{ pageSize: 10 }} />
          </>
        ) : (
          <Empty description='Không có lịch hẹn chưa xét nghiệm' />
        )}
      </Card>

      <Modal
        title='Xác nhận đã xét nghiệm'
        open={confirmModalVisible}
        onOk={handleConfirmAppointment}
        onCancel={() => setConfirmModalVisible(false)}
        okText='Xác nhận'
        cancelText='Hủy'
        confirmLoading={confirmLoading}
        centered
      >
        <div>
          <p>Bạn xác nhận đã tiến hành xét nghiệm cho khách hàng này?</p>
          {selectedAppointment && (
            <div className='mt-4 p-4 bg-gray-50 rounded'>
              <p>
                <strong>Khách hàng:</strong> {selectedAppointment.customerName}
              </p>
              <p>
                <strong>Dịch vụ:</strong> {selectedAppointment.serviceName}
              </p>
              <p>
                <strong>Ngày hẹn:</strong> {format(new Date(selectedAppointment.date), 'dd/MM/yyyy')}
              </p>
              <p>
                <strong>Ca:</strong> {selectedAppointment.shift === 'AM' ? 'Sáng' : 'Chiều'}
              </p>
            </div>
          )}
          <div className='mt-4 text-sm text-gray-600'>
            <p>💡 Sau khi xác nhận, trạng thái sẽ chuyển sang "Đã xét nghiệm"</p>
            <p>📋 Bạn có thể tải lên kết quả ở trang "Quản lý kết quả xét nghiệm"</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AppointmentsManagement
