import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentUser: null,
  token: null,
  isAuthenticated: false,
  role: null
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      // Map the login response fields to our state
      state.currentUser = {
        id: action.payload.accountId,
        email: action.payload.email,
        name: action.payload.fullName // This fixes the name property
      }
      state.token = action.payload.accessToken
      state.role = action.payload.role
      state.isAuthenticated = true

      // Store token in localStorage for persistence
      localStorage.setItem('token', action.payload.accessToken)
    },
    logout: (state) => {
      state.currentUser = null
      state.token = null
      state.isAuthenticated = false
      state.role = null

      // Clear token from localStorage
      localStorage.removeItem('token')
    }
  }
})

// Action creators
export const { login, logout } = userSlice.actions

export default userSlice.reducer
