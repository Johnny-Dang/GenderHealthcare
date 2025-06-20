import axios from 'axios'

// Set config defaults when creating the instance
const api = axios.create({
  baseURL: 'https://localhost:7195/',
  withCredentials: true // Để gửi cookie refreshToken lên backend
})

api.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    // const tokenString = localStorage.getItem('token');
    // const token = tokenString ? JSON.parse(tokenString) : null;
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } 
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post('https://localhost:7195/Account/refresh-token', {}, { withCredentials: true });
        const newAccessToken = res.data.accessToken;
        localStorage.setItem('token', JSON.stringify(newAccessToken));
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        processQueue(null, newAccessToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api
