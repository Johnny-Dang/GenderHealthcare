import React, { useState } from 'react'
import { Layout, Typography, Input, Button, Table, Spin, Alert, Form, Card, Badge, Empty, Tag } from 'antd'
import { Search, FileText, User, Phone, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import api from '../../configs/axios'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'

const { Content } = Layout
const { Title, Text } = Typography

const TestResultsPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại')
      return
    }

    setLoading(true)
    setError('')
    setSearched(true)

    try {
      const response = await api.get(`/api/TestResult/by-phone/${phoneNumber}`)
      setResults(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra khi tìm kiếm')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status) => {
    let color = 'default'
    let icon = <Clock className='w-4 h-4 mr-1 text-orange-500' />
    let text = status || 'Đang xử lý'

    if (status && status.toLowerCase().includes('kết quả')) {
      color = 'success'
      icon = <CheckCircle className='w-4 h-4 mr-1 text-green-500' />
    }

    return (
      <Tag color={color}>
        <span className='flex items-center'>
          {icon}
          {text}
        </span>
      </Tag>
    )
  }

  const columns = [
    {
      title: 'Thông tin khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: '30%',
      render: (name) => (
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Badge dot status='processing' />
            <Text strong>{name}</Text>
          </div>
          <div className='flex items-center text-gray-500 text-sm'>
            <Phone className='w-3.5 h-3.5 mr-1.5 text-pink-500' />
            <Text type='secondary'>{phoneNumber}</Text>
          </div>
          <Tag color='pink' style={{ marginTop: '4px' }}>
            <span className='flex items-center'>
              <User className='w-3.5 h-3.5 mr-1' />
              Khách hàng
            </span>
          </Tag>
        </div>
      )
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: '30%',
      render: (serviceName) => (
        <div className='flex items-center'>
          <FileText className='w-4 h-4 mr-2 text-pink-500' />
          <span>{serviceName}</span>
        </div>
      )
    },
    {
      title: 'Kết quả',
      dataIndex: 'result',
      key: 'result',
      width: '30%',
      render: (result) => (
        <div className='flex'>
          <FileText className='w-4 h-4 mr-2 mt-1 text-pink-400 flex-shrink-0' />
          <span>{result || <span className='text-gray-400 italic'>Chưa có kết quả</span>}</span>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status) => getStatusTag(status)
    }
  ]

  const stats = {
    total: results.length,
    completed: results.filter((r) => r.status && r.status.toLowerCase().includes('kết quả')).length,
    processing: results.filter((r) => !r.status || !r.status.toLowerCase().includes('kết quả')).length
  }

  return (
    <div className='min-h-screen flex flex-col bg-pink-50'>
      <Navigation />

      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className='mb-8'>
          <div className='bg-white border border-pink-100 p-6 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between'>
            <div>
              <Title level={3} className='text-[#be185d] m-0 flex items-center'>
                <FileText className='w-7 h-7 mr-3 text-pink-500' /> Tra cứu kết quả xét nghiệm
              </Title>
              <Text className='text-pink-600'>Tìm kiếm và xem kết quả xét nghiệm của khách hàng</Text>
            </div>
          </div>
        </div>

        <Card className='shadow-sm mb-6'>
          <Form layout='inline' onSubmit={handleSearch} className='mb-2'>
            <div className='w-full flex flex-wrap gap-4 items-center'>
              <Input
                placeholder='Nhập số điện thoại (Ví dụ: 0933444555)'
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{ width: '300px' }}
                prefix={<Phone size={16} className='text-pink-500 mr-2' />}
                className='border-pink-200 focus:border-pink-400'
              />
              <Button
                type='primary'
                onClick={handleSearch}
                disabled={loading}
                icon={<Search size={16} />}
                className='bg-pink-500 border-pink-500 hover:bg-pink-600 hover:border-pink-600'
              >
                Tìm kiếm
              </Button>
            </div>
          </Form>
        </Card>

        {loading && (
          <div className='text-center p-12 bg-white rounded-xl shadow-sm'>
            <Spin size='large' />
            <div className='mt-4 text-pink-600'>Đang tìm kiếm kết quả...</div>
          </div>
        )}

        {error && (
          <Alert message={error} type='error' showIcon style={{ marginBottom: '16px' }} className='rounded-lg' />
        )}

        {!loading && searched && Array.isArray(results) && results.length > 0 && (
          <div className='bg-white rounded-xl shadow-sm'>
            <div className='p-6'>
              {/* Tổng quan */}
              <div className='mb-8 grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-pink-100 rounded-lg p-4 text-center'>
                  <div className='text-2xl font-bold text-pink-600'>{stats.total}</div>
                  <div className='text-sm text-pink-700'>Tổng số kết quả</div>
                </div>
                <div className='bg-green-100 rounded-lg p-4 text-center'>
                  <div className='text-2xl font-bold text-green-600'>{stats.completed}</div>
                  <div className='text-sm text-green-700'>Đã hoàn thành</div>
                </div>
                <div className='bg-yellow-100 rounded-lg p-4 text-center'>
                  <div className='text-2xl font-bold text-yellow-600'>{stats.processing}</div>
                  <div className='text-sm text-yellow-700'>Đang xử lý</div>
                </div>
              </div>

              <Table
                dataSource={results.map((item) => ({ ...item, key: item.resultId }))}
                columns={columns}
                pagination={false}
                bordered
                rowClassName={(record) => (record.status ? '' : 'bg-pink-50')}
                locale={{
                  emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Không tìm thấy kết quả' />
                }}
              />
            </div>
          </div>
        )}

        {!loading && searched && (!results || results.length === 0) && !error && (
          <div className='bg-white p-8 rounded-xl shadow-sm text-center'>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description='Không tìm thấy kết quả xét nghiệm cho số điện thoại này'
            />
            <Button
              onClick={() => setSearched(false)}
              className='mt-4 border-pink-300 text-pink-600 hover:border-pink-500'
              icon={<RefreshCw size={16} />}
            >
              Tìm kiếm lại
            </Button>
          </div>
        )}
      </Content>

      <Footer />
    </div>
  )
}

export default TestResultsPage
