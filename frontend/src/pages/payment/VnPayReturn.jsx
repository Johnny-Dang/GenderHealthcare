import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from '../../configs/axios'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { resetCart } from '@/redux/features/userSlice'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

// Hàm ánh xạ mã lỗi VNPAY sang thông báo tiếng Việt
const getVnPayMessage = (code) => {
  switch (code) {
    case '00':
      return 'Giao dịch thành công.'
    case '07':
      return 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).'
    case '09':
      return 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.'
    case '10':
      return 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.'
    case '11':
      return 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.'
    case '12':
      return 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.'
    case '13':
      return 'Giao dịch không thành công do nhập sai mật khẩu xác thực giao dịch (OTP). Vui lòng thực hiện lại.'
    case '24':
      return 'Giao dịch không thành công do: Khách hàng hủy giao dịch.'
    case '51':
      return 'Giao dịch không thành công do: Tài khoản không đủ số dư.'
    case '65':
      return 'Giao dịch không thành công do: Tài khoản đã vượt quá hạn mức giao dịch trong ngày.'
    case '75':
      return 'Ngân hàng thanh toán đang bảo trì.'
    case '79':
      return 'Giao dịch không thành công do nhập sai mật khẩu thanh toán quá số lần quy định.'
    case '99':
      return 'Lỗi không xác định hoặc lỗi khác.'
    default:
      return 'Không xác định mã phản hồi từ VNPAY.'
  }
}

export default function VnPayReturn() {
  const userInfo = useSelector((state) => state.user.userInfo)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const calledRef = useRef(false)

  // Hàm xác định trạng thái thành công dựa vào mã VNPAY
  const isSuccess = result?.vnPayResponseCode === '00'

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true
    if (!userInfo || userInfo.role !== 'Customer') {
      navigate('/')
      return
    }

    const processPayment = async () => {
      try {
        const response = await axios.get(`/api/payments/vnpay-callback${window.location.search}`)
        setResult(response.data)
        if (response.data?.vnPayResponseCode === '00') {
          dispatch(resetCart())
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi xử lý thanh toán')
      } finally {
        setLoading(false)
      }
    }

    processPayment()
    // eslint-disable-next-line
  }, [])

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50'>
        <div className='text-center'>
          <Loader2 className='h-10 w-10 animate-spin mx-auto mb-6 text-primary-500' />
          <p className='text-lg text-gray-700 font-medium'>Đang xử lý thanh toán...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 py-12'>
      <Card className='w-full max-w-lg mx-auto p-8 shadow-xl rounded-2xl border-0'>
        <div className='flex flex-col items-center'>
          {error ? (
            <>
              <XCircle className='h-20 w-20 text-red-500 mb-4' />
              <h2 className='text-3xl font-bold text-gray-900 mb-2'>Thanh toán thất bại</h2>
              <p className='text-gray-600 mb-6'>{error}</p>
            </>
          ) : (
            <>
              {isSuccess ? (
                <CheckCircle className='h-20 w-20 text-green-500 mb-4' />
              ) : (
                <XCircle className='h-20 w-20 text-red-500 mb-4' />
              )}
              <h2 className={`text-3xl font-bold mb-2 ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
              </h2>
              <p className='text-gray-600 mb-6'>
                {isSuccess
                  ? 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Đơn hàng của bạn đã được ghi nhận.'
                  : getVnPayMessage(result?.vnPayResponseCode)}
              </p>
              <div className='w-full bg-gray-50 rounded-xl p-4 mb-6'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-xs text-gray-500'>Mã giao dịch</p>
                    <p className='font-semibold text-gray-800 break-all'>{result?.transactionId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Số tiền</p>
                    <p className='font-semibold text-gray-800'>
                      {parseInt(result?.amount || 0).toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Phương thức</p>
                    <p className='font-semibold text-gray-800'>{result?.paymentMethod || 'VNPAY'}</p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Mã phản hồi</p>
                    <p className='font-semibold text-gray-800'>{result?.vnPayResponseCode || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </>
          )}
          <Button className='w-full mt-2' onClick={() => navigate('/test-service')}>
            Tiếp tục đặt dịch vụ
          </Button>
          <Button className='w-full mt-2' variant='outline' onClick={() => navigate('/')}> 
            Trở về trang chủ
          </Button>
        </div>
      </Card>
    </div>
  )
}

export {VnPayReturn}