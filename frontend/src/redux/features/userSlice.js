import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userInfo: null,
  bookingId: '',
  cartCount: 0,
  cartShouldReload: false
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      // Lưu toàn bộ thông tin từ response API vào userInfo
      state.userInfo = action.payload
      localStorage.setItem('token', action.payload.accessToken)
    },
    logout: (state) => {
      state.userInfo = null
      state.bookingId = ''
      state.cartCount = 0
      state.cartShouldReload = false

      // Đảm bảo xóa token
      localStorage.removeItem('token')
    },
    setBookingId: (state, action) => {
      state.bookingId = action.payload
    },
    incrementCart: (state) => {
      state.cartCount += 1
    },
    setCartCount: (state, action) => {
      state.cartCount = action.payload
    },
    setCartShouldReload: (state, action) => {
      state.cartShouldReload = action.payload
    },
    resetCart: (state) => {
      state.bookingId = ''
      state.cartCount = 0
      state.cartShouldReload = false
    }
  }
})

// Action creators are generated for each case reducer function
export const { login, logout, setBookingId, incrementCart, setCartCount, setCartShouldReload, resetCart } =
  userSlice.actions

export default userSlice.reducer
