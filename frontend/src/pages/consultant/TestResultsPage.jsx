import React, { useState } from 'react'
import {
  Layout,
  Typography,
  Input,
  Button,
  Table,
  Space,
  Spin,
  Alert,
  Form,
  Card,
  Badge,
  Empty,
  Row,
  Col,
  Statistic
} from 'antd'
import { Search, Calendar, FileText, User, Phone, CheckCircle, XCircle, RefreshCw, Tag } from 'lucide-react'
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

      const responseData = response.data
      if (Array.isArray(responseData)) {
        setResults(responseData)
        if (responseData.length === 0) {
          setError('Không tìm thấy kết quả xét nghiệm cho số điện thoại này')
        }
      } else if (responseData && typeof responseData === 'object') {
        setResults([responseData])
      } else {
        setError('Định dạng dữ liệu không đúng. Vui lòng thử lại sau.')
        setResults([])
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Thông tin khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: '25%',
      render: (name, record) => (
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Badge dot status='processing' />
            <Text strong>{name}</Text>
          </div>
          <div className='flex items-center text-gray-500 text-sm'>
            <Phone className='w-3.5 h-3.5 mr-1.5 text-blue-500' />
            <Text type='secondary'>{phoneNumber}</Text>
          </div>
          <Tag color='blue' style={{ marginTop: '4px' }}>
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
      width: '25%',
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
      width: '20%',
      render: (status) => (
        <Tag color={status ? 'success' : 'warning'}>
          <span className='flex items-center'>
            {status ? (
              <CheckCircle className='w-4 h-4 mr-1 text-pink-500' />
            ) : (
              <XCircle className='w-4 h-4 mr-1 text-pink-500' />
            )}
            {status ? 'Hoàn thành' : 'Đang xử lý'}
          </span>
        </Tag>
      )
    }
  ]

  const stats = {
    total: results.length,
    completed: results.filter((r) => r.status).length,
    processing: results.filter((r) => !r.status).length
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
