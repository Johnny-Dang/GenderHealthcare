import axios from 'axios'
import { store } from '@/redux/store'
import { login, logout } from '@/redux/features/userSlice'

// Set config defaults when creating the instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, //'https://localhost:7195',
  withCredentials: true, // Để gửi cookie refreshToken lên backend
  timeout: 30000
})

api.interceptors.request.use(
  (config) => {
    // Lấy token từ Redux store thay vì localStorage
    const userInfo = store.getState().user?.userInfo || {}
    const token = userInfo?.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null, userData = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve({ token, userData })
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then(({ token, userData }) => {
          if (token) {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            if (userData) store.dispatch(login(userData))
          }
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await api.post('/Account/refresh-token', {}, { withCredentials: true })
        const newAccessToken = res.data.accessToken

        // Cập nhật user mới vào Redux nếu response trả về thông tin user
        if (res.data && res.data.accountId) {
          store.dispatch(login(res.data))
        }

        processQueue(null, newAccessToken, res.data)
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        store.dispatch(logout())
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
