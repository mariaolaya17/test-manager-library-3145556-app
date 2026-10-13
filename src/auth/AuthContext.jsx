import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiFetch, setToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setTokenState] = useState(sessionStorage.getItem('auth_token'))
  const [role, setRole] = useState(sessionStorage.getItem('auth_role'))

  useEffect(() => {
    if (!token) {
      setUser(null)
      setRole(null)
      sessionStorage.removeItem('auth_role')
    }
  }, [token])

  const login = useCallback(async (username, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: { username, password },
    })

    setToken(data.access_token)
    setTokenState(data.access_token)
    setRole(data.role)
    sessionStorage.setItem('auth_role', data.role)
    setUser({ username, role: data.role })

    return data
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setTokenState(null)
    setUser(null)
    setRole(null)
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_role')
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
