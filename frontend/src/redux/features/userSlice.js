import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userInfo: {},
  bookingId: '',
  cartCount: 0,
  cartShouldReload: false
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    initialize: (state, action) => {
      // Khởi tạo state nếu chưa có
      return {
        ...initialState,
        ...action.payload
      }
    },
    login: (state, action) => {
      // Lưu toàn bộ thông tin từ response API vào userInfo
      state.userInfo = action.payload
    },
    logout: (state) => {
      state.userInfo = {}
      state.bookingId = ''
      state.cartCount = 0
      state.cartShouldReload = false
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
export const { initialize, login, logout, setBookingId, incrementCart, setCartCount, setCartShouldReload, resetCart } =
  userSlice.actions

export default userSlice.reducer
