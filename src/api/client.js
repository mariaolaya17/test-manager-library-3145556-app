const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

let authToken = sessionStorage.getItem('auth_token') || null

export function setToken(token) {
  authToken = token
  if (token) {
    sessionStorage.setItem('auth_token', token)
  } else {
    sessionStorage.removeItem('auth_token')
  }
}

export function getToken() {
  return authToken
}

export class ApiError extends Error {
  constructor(code, message, details, status) {
    super(message)
    this.code = code
    this.details = details || []
    this.status = status
  }
}

export async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path}`

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const config = {
    ...options,
    headers,
  }

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, config)

  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      data?.code || 'UNKNOWN_ERROR',
      data?.message || `Request failed with status ${response.status}`,
      data?.details || [],
      response.status
    )
  }

  return data
}

export function buildQueryString(params) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })

  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}
