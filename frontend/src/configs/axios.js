import axios from 'axios'
import { store } from '@/redux/store'
import { login, logout } from '@/redux/features/userSlice'

// Set config defaults when creating the instance
const api = axios.create({
  baseURL: 'https://localhost:7195/',
  withCredentials: true // Để gửi cookie refreshToken lên backend
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
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
        const res = await axios.post('https://localhost:7195/Account/refresh-token', {}, { withCredentials: true })
        const newAccessToken = res.data.accessToken
        localStorage.setItem('token', newAccessToken)
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken

        // Cập nhật user mới vào Redux nếu response trả về thông tin user
        if (res.data && res.data.accountId) {
          store.dispatch(login(res.data))
        }

        processQueue(null, newAccessToken, res.data)
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('token')
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
