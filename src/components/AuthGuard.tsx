'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function AuthGuard({ 
  children, 
  fallback = <div className="min-h-screen flex items-center justify-center"><div className="text-lg">読み込み中...</div></div>
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // 認証チェック中
  if (loading) {
    return <>{fallback}</>
  }

  // 認証されていない場合
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">認証が必要です。ログインページにリダイレクトしています...</div>
      </div>
    )
  }

  // 認証済み
  return <>{children}</>
}