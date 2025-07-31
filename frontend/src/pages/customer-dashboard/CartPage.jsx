import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { setCartCount, setCartShouldReload, resetCart } from '@/redux/features/userSlice'
import { Trash2, Pencil, ShoppingCart, AlertTriangle } from 'lucide-react'
import ServiceBookingForm from '@/components/ServiceBookingForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Loading from '../../components/Loading'
import { useToast } from '@/hooks/useToast'
import api from '../../configs/axios'

export default function CartPage() {
  const { showSuccess, showError } = useToast()

  const bookingId = useSelector((state) => state.user.bookingId)
  const cartShouldReload = useSelector((state) => state.user.cartShouldReload)
  const dispatch = useDispatch()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteCartModal, setDeleteCartModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [paymentConfirmModal, setPaymentConfirmModal] = useState(false)

  // Function để format ca làm việc
  const formatShift = (shift) => {
    if (shift === 'AM') {
      return 'Sáng (7h30 - 12h)'
    } else if (shift === 'PM') {
      return 'Chiều (13h30 - 17h30)'
    }
    return shift || 'Chưa có thông tin'
  }

  const fetchServices = () => {
    if (bookingId) {
      setLoading(true)
      api
        .get(`/api/booking-details/booking/${bookingId}`)
        .then((res) => {
          setServices(res.data)
          dispatch(setCartCount(res.data.length))
        })
        .catch(() => setServices([]))
        .finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    fetchServices()
    // eslint-disable-next-line
  }, [bookingId])

  useEffect(() => {
    if (cartShouldReload) {
      fetchServices()
      dispatch(setCartShouldReload(false))
    }
  }, [cartShouldReload, dispatch])

  const handleDelete = async (bookingDetailId) => {
    if (!window.confirm('Bạn có chắc muốn xoá dịch vụ này khỏi giỏ hàng?')) return
    try {
      await api.delete(`/api/booking-details/${bookingDetailId}`)
      // Fetch lại dịch vụ sau khi xóa
      const res = await api.get(`/api/booking-details/booking/${bookingId}`)
      setServices(res.data)
      dispatch(setCartCount(res.data.length))
      if (res.data.length === 0) {
        // Nếu không còn dịch vụ nào, xóa luôn bookingId
        await api.delete(`/api/bookings/${bookingId}`)
        dispatch(resetCart())
        showSuccess('Đã xóa dịch vụ và giỏ hàng!')
      } else {
        showSuccess('Đã xóa dịch vụ khỏi giỏ hàng!')
      }
    } catch {
      showError('Xoá thất bại!')
    }
  }

  const handleDeleteCart = async () => {
    if (!bookingId) {
      showError('Không có giỏ hàng để xóa!')
      return
    }

    setDeleteLoading(true)
    try {
      await api.delete(`/api/bookings/${bookingId}`)
      dispatch(resetCart())
      setServices([])
      setDeleteCartModal(false)
      showSuccess('Đã xóa giỏ hàng thành công!')
    } catch (error) {
      console.error('Error deleting cart:', error)
      showError('Xóa giỏ hàng thất bại! Vui lòng thử lại.')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Tính tổng tiền
  const total = services.reduce((sum, s) => sum + (s.price || 0), 0)

  const handlePayment = () => {
    if (!bookingId || total <= 0) {
      showError('Không có dịch vụ nào để thanh toán!')
      return
    }
    setPaymentConfirmModal(true)
  }

  const handleConfirmPayment = async () => {
    setPaymentConfirmModal(false)
    try {
      const res = await api.post('/api/payments/create-vnpay-url', {
        bookingId,
        amount: total,
        orderDescription: 'Xét Nghiệm STis',
        orderType: 'Xét Nghiệm'
      })
      if (res.data && typeof res.data === 'string') {
        window.location.href = res.data
      } else if (res.data && res.data.url) {
        window.location.href = res.data.url
      } else {
        showError('Không nhận được link thanh toán!')
      }
    } catch {
      showError('Tạo link thanh toán thất bại!')
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-pink-50'>
      <Navigation />
      <div className='max-w-4xl mx-auto py-12 px-4'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-8'>
          <h2 className='text-3xl font-bold text-primary-700'>Dịch vụ trong giỏ hàng</h2>
          {services.length > 0 && (
            <Button
              variant='destructive'
              className='flex items-center gap-2 mt-4 md:mt-0'
              onClick={() => setDeleteCartModal(true)}
            >
              <Trash2 className='w-4 h-4' />
              Xóa giỏ hàng
            </Button>
          )}
        </div>

        {loading ? (
          <div className='flex flex-col items-center py-12'>
            <span className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-4'></span>
            <span className='text-primary-500'>Đang tải...</span>
          </div>
        ) : services.length === 0 ? (
          <div className='flex flex-col items-center py-16'>
            <ShoppingCart className='w-16 h-16 text-gray-400 mb-4' />
            <p className='mt-4 text-gray-500 text-lg'>Bạn chưa thêm dịch vụ nào vào giỏ hàng.</p>
            <p className='text-gray-400 text-sm mt-2'>Hãy chọn dịch vụ để bắt đầu đặt lịch xét nghiệm.</p>
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2'>
            {services.map((s) => (
              <div
                key={s.bookingDetailId}
                className='bg-white rounded-xl shadow-md p-6 flex flex-col justify-between border border-gray-100 hover:shadow-lg transition'
              >
                <div className='flex items-center justify-between mb-2'>
                  <div>
                    <div className='text-lg font-bold text-primary-700 flex items-center gap-2'>
                      <span>{s.serviceName}</span>
                    </div>
                    <div className='text-pink-600 font-semibold text-xl mt-1'>
                      {s.price?.toLocaleString()} <span className='text-base font-normal'>VNĐ</span>
                    </div>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-2 text-sm text-gray-700 mt-4'>
                  <div>
                    <span className='font-medium'>Họ:</span> {s.lastName}
                  </div>
                  <div>
                    <span className='font-medium'>Tên:</span> {s.firstName}
                  </div>
                  <div>
                    <span className='font-medium'>SĐT:</span> {s.phone}
                  </div>
                  <div>
                    <span className='font-medium'>Ngày sinh:</span> {s.dateOfBirth}
                  </div>
                  <div>
                    <span className='font-medium'>Giới tính:</span> {s.gender ? 'Nam' : 'Nữ'}
                  </div>
                  <div>
                    <span className='font-medium'>Ngày đặt:</span> {s.slotDate || 'Chưa có thông tin'}
                  </div>
                  <div>
                    <span className='font-medium'>Ca đặt:</span> {formatShift(s.slotShift)}
                  </div>
                </div>
                <div className='flex gap-3 mt-6 justify-end'>
                  <button
                    className='inline-flex items-center px-3 py-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded transition shadow'
                    onClick={() => {
                      setEditData(s)
                      setEditOpen(true)
                    }}
                    title='Chỉnh sửa dịch vụ'
                  >
                    <Pencil className='w-4 h-4 mr-1' /> Chỉnh sửa
                  </button>
                  <button
                    className='inline-flex items-center px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded transition shadow'
                    onClick={() => handleDelete(s.bookingDetailId)}
                    title='Xoá dịch vụ'
                  >
                    <Trash2 className='w-4 h-4 mr-1' /> Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Tổng tiền và nút thanh toán */}
        {services.length > 0 && (
          <div className='mt-10 flex flex-col md:flex-row justify-end items-end gap-4'>
            <div className='bg-white rounded-lg shadow px-8 py-4 text-lg font-bold text-primary-700 border border-primary-100'>
              Tổng cộng: <span className='text-pink-600'>{total.toLocaleString()} VNĐ</span>
            </div>
            <button
              className='bg-gradient-to-r from-pink-500 to-primary-500 text-white font-bold px-8 py-4 rounded-lg shadow hover:opacity-90 transition text-lg'
              onClick={handlePayment}
            >
              Thanh toán
            </button>
          </div>
        )}
      </div>

      {editOpen && (
        <ServiceBookingForm
          open={editOpen}
          onOpenChange={setEditOpen}
          bookingDetail={editData}
          onSuccess={() => {
            fetchServices()
            setEditOpen(false)
          }}
          onSlotUpdate={() => {}}
        />
      )}

      {/* Delete Cart Confirmation Modal */}
      <Dialog open={deleteCartModal} onOpenChange={setDeleteCartModal}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-red-600'>
              <AlertTriangle className='w-5 h-5' />
              Xác nhận xóa giỏ hàng
            </DialogTitle>
            <DialogDescription className='text-gray-600 mt-2'>
              Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng hiện tại không? Hành động này sẽ xóa tất cả dịch vụ đã chọn và
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-6'>
            <Button variant='outline' onClick={() => setDeleteCartModal(false)} disabled={deleteLoading}>
              Hủy
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteCart}
              disabled={deleteLoading}
              className='flex items-center gap-2'
            >
              {deleteLoading ? (
                <>
                  <span className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></span>
                  <Loading />
                </>
              ) : (
                <>
                  <Trash2 className='w-4 h-4' />
                  Xóa giỏ hàng
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Modal */}
      <Dialog open={paymentConfirmModal} onOpenChange={setPaymentConfirmModal}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-orange-600'>
              <AlertTriangle className='w-5 h-5' />
              Xác nhận thanh toán
            </DialogTitle>
            <DialogDescription className='text-gray-600 mt-2'>
              <div className='space-y-3'>
                <p className='font-medium text-gray-800'>Bạn có chắc chắn muốn tiến hành thanh toán không?</p>
                <div className='bg-orange-50 border border-orange-200 rounded-lg p-3'>
                  <p className='text-orange-800 text-sm font-medium'>⚠️ Lưu ý quan trọng:</p>
                  <ul className='text-orange-700 text-sm mt-2 space-y-1'>
                    <li>• Bạn cam kết sẽ đi xét nghiệm đúng lịch đã đặt</li>
                    <li>• Sau khi thanh toán, bạn không thể chỉnh sửa thông tin</li>
                    <li>• Vui lòng kiểm tra kỹ thông tin trước khi xác nhận</li>
                  </ul>
                </div>
                <div className='bg-gray-50 rounded-lg p-3'>
                  <p className='text-gray-700 font-medium'>
                    Tổng tiền: <span className='text-pink-600 font-bold'>{total.toLocaleString()} VNĐ</span>
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-6'>
            <Button variant='outline' onClick={() => setPaymentConfirmModal(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleConfirmPayment}
              className='bg-gradient-to-r from-pink-500 to-primary-500 hover:from-pink-600 hover:to-primary-600'
            >
              Xác nhận thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
