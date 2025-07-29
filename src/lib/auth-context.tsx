'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient, LoginRequest, LoginResponse } from './api'

interface AuthContextType {
  user: LoginResponse['admin_user'] | null
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginResponse['admin_user'] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        setLoading(false)
        return
      }

      const currentUser = await apiClient.getCurrentAdmin()
      setUser(currentUser)
    } catch (error) {
      console.error('Auth check failed:', error)
      apiClient.clearToken()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiClient.login(credentials)
      apiClient.setToken(response.token)
      setUser(response.admin_user)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      apiClient.clearToken()
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}