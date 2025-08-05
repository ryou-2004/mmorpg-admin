'use client'

import { ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  // 現在は認証チェックなしで全て通す
  // 後で実際の認証ロジックを実装
  return <>{children}</>
}