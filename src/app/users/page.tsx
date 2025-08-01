'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface User {
  id: number
  username: string
  email: string
  created_at: string
  last_login_at?: string
  player_count: number
  is_active: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<{ data: User[] }>('/admin/users')
      setUsers(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ユーザーの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="ユーザー管理">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">読み込み中...</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <AdminLayout title="ユーザー管理">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">エラー: {error}</div>
            <button
              onClick={fetchUsers}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
              再試行
            </button>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdminLayout title="ユーザー管理">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                ユーザー一覧 ({users.length}人)
              </h3>
              <button
                onClick={fetchUsers}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                更新
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div key={user.id} className="relative">
                  <Link href={`/users/${user.id}`} className="block">
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{user.username}</h4>
                        <span className="text-sm text-gray-500">ID: {user.id}</span>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-gray-500">メール:</span>
                          <span className="ml-1 font-medium">{user.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">プレイヤー数:</span>
                          <span className="ml-1 font-medium">{user.player_count}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">最終ログイン:</span>
                          <span className="ml-1 font-medium">
                            {user.last_login_at ? 
                              new Date(user.last_login_at).toLocaleDateString('ja-JP') : 
                              'なし'
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">作成日:</span>
                          <span className="ml-1 font-medium">
                            {new Date(user.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-end">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'アクティブ' : '無効'}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="absolute top-2 right-2 z-10">
                    <Link
                      href={`/users/${user.id}/edit`}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      編集
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}