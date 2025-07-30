'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface AdminLayoutProps {
  children: ReactNode
  title: string
  showBackButton?: boolean
  backHref?: string
}

export default function AdminLayout({ 
  children, 
  title, 
  showBackButton = false, 
  backHref = '/dashboard' 
}: AdminLayoutProps) {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {showBackButton && (
                <button
                  onClick={() => router.push(backHref)}
                  className="mr-4 px-3 py-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                >
                  ← 戻る
                </button>
              )}
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-gray-700">
                  {user.name} ({user.role})
                </span>
              )}
              <Link
                href="/dashboard"
                className="px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              >
                ダッシュボード
              </Link>
              <Link
                href="/users"
                className="px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              >
                ユーザー管理
              </Link>
              <Link
                href="/players"
                className="px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              >
                プレイヤー管理
              </Link>
              <Link
                href="/job-classes"
                className="px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              >
                職業管理
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  )
}