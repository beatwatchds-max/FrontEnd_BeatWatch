import useAuthStore from '../store/authStore'

const BASE_URL = 'https://backend-beatwatch.onrender.com'

function getStoredToken() {
  try {
    const raw = localStorage.getItem('bookstack-auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.state?.token) return parsed.state.token
    }
  } catch {}
  return localStorage.getItem('auth_token')
}

function buildHeaders(method, customHeaders = {}) {
  const headers = { ...customHeaders }

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    headers['Content-Type'] = 'application/json'
  }

  const token = getStoredToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

async function request(method, endpoint, { body, headers: customHeaders } = {}) {
  const url = `${BASE_URL}${endpoint}`

  const config = {
    method,
    headers: buildHeaders(method, customHeaders),
  }

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    let errorPayload
    try {
      errorPayload = await response.json()
    } catch {
      errorPayload = { message: response.statusText }
    }

    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }

    const message = errorPayload.message || errorPayload.mensaje || errorPayload.error || `Error ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.payload = errorPayload
    throw error
  }

  if (response.status === 204) return null

  return response.json()
}

const apiClient = {
  get: (endpoint, options) => request('GET', endpoint, options),
  post: (endpoint, body, options) => request('POST', endpoint, { ...options, body }),
  put: (endpoint, body, options) => request('PUT', endpoint, { ...options, body }),
  patch: (endpoint, body, options) => request('PATCH', endpoint, { ...options, body }),
  delete: (endpoint, options) => request('DELETE', endpoint, options),
}

export default apiClient
