import axios from 'axios'

export const BASE_URL = 'http://localhost:5072'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('xc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('xc_token')
      localStorage.removeItem('xc_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
