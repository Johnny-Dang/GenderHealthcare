import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setBookingId, setCartCount } from '@/redux/features/userSlice'
import api from '@/configs/axios'
import { useToast } from './useToast'

export const useCart = () => {
  const dispatch = useDispatch()
  const { showError } = useToast()
  const userInfo = useSelector((state) => state.user.userInfo)
  const bookingId = useSelector((state) => state.user.bookingId)

  const fetchUnpaidBooking = async () => {
    if (!userInfo?.accountId) return

    try {
      const response = await api.get(`/api/bookings/account/${userInfo.accountId}`)
      
      if (response.data && response.data.bookingId) {
        // Lưu bookingId vào Redux
        dispatch(setBookingId(response.data.bookingId))
        
        // Fetch booking details để đếm số lượng
        const detailsResponse = await api.get(`/api/booking-details/booking/${response.data.bookingId}`)
        if (detailsResponse.data) {
          dispatch(setCartCount(detailsResponse.data.length))
        }
      } else {
        // Không có booking chưa thanh toán
        dispatch(setBookingId(''))
        dispatch(setCartCount(0))
      }
    } catch (error) {
      console.error('Error fetching unpaid booking:', error)
      // Không hiển thị toast lỗi vì có thể user chưa có booking
    }
  }

  const refreshCart = async () => {
    if (!bookingId) return

    try {
      const response = await api.get(`/api/booking-details/booking/${bookingId}`)
      if (response.data) {
        dispatch(setCartCount(response.data.length))
      }
    } catch (error) {
      console.error('Error refreshing cart:', error)
      showError('Không thể cập nhật giỏ hàng')
    }
  }

  // Tự động fetch booking chưa thanh toán khi user login
  useEffect(() => {
    if (userInfo?.accountId && !bookingId) {
      fetchUnpaidBooking()
    }
  }, [userInfo?.accountId])

  return {
    fetchUnpaidBooking,
    refreshCart
  }
} 