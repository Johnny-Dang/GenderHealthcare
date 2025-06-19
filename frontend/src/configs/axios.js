import axios from 'axios'

// Set config defaults when creating the instance
const api = axios.create({
  baseURL: 'https://localhost:7195/'
})

api.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    const token = JSON.parse(localStorage.getItem('token'))
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api
