const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface LoginRequest {
  session: {
    email: string
    password: string
  }
}

export interface LoginResponse {
  token: string
  admin_user: {
    id: number
    email: string
    name: string
    role: string
  }
}

export interface ApiError {
  error: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const token = this.getToken()
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('admin_token')
  }

  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token)
    }
  }

  public clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
    }
  }

  // 認証関連
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/admin/session', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async logout(): Promise<void> {
    await this.request('/admin/session', {
      method: 'DELETE',
    })
    this.clearToken()
  }

  async getCurrentAdmin(): Promise<LoginResponse['admin_user']> {
    const response = await this.request<{ admin_user: LoginResponse['admin_user'] }>('/admin/session')
    return response.admin_user
  }

  // ダッシュボード
  async getDashboard(): Promise<any> {
    return this.request('/admin/dashboard')
  }

  // 汎用CRUDメソッド
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient()