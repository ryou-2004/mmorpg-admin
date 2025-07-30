'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface JobClass {
  id: number
  name: string
  job_type: string
  level: number
  experience: number
  unlocked_at: string
}

interface Player {
  id: number
  name: string
  gold: number
  active: boolean
  created_at: string
  last_login_at: string | null
  job_classes: JobClass[]
}

interface User {
  id: number
  name: string
  email: string
  active: boolean
  created_at: string
  last_login_at: string | null
  players: Player[]
}

export default function UserDetail() {
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get<{ data: User }>(`/admin/users/${params.id}`)
        setUser(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [params.id])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未ログイン'
    return new Date(dateString).toLocaleString('ja-JP')
  }

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'basic': return 'bg-blue-100 text-blue-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      case 'special': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getJobTypeName = (jobType: string) => {
    switch (jobType) {
      case 'basic': return '基本職'
      case 'advanced': return '上級職'
      case 'special': return '特殊職'
      default: return jobType
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="ユーザー詳細" showBackButton backHref="/users">
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
        <AdminLayout title="ユーザー詳細" showBackButton backHref="/users">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">エラー: {error}</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (!user) {
    return (
      <AuthGuard>
        <AdminLayout title="ユーザー詳細" showBackButton backHref="/users">
          <div className="text-center text-gray-500">ユーザーが見つかりません</div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdminLayout title="ユーザー詳細" showBackButton backHref="/users">

      {/* ユーザー基本情報 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">基本情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID</label>
            <p className="mt-1 text-sm text-gray-900">{user.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">名前</label>
            <p className="mt-1 text-sm text-gray-900">{user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ステータス</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user.active ? 'アクティブ' : '無効'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">登録日時</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(user.created_at)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">最終ログイン</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(user.last_login_at)}</p>
          </div>
        </div>
      </div>

      {/* プレイヤー一覧 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          プレイヤー一覧 ({user.players.length}キャラクター)
        </h2>
        
        {user.players.length === 0 ? (
          <p className="text-gray-500">プレイヤーが存在しません</p>
        ) : (
          <div className="space-y-6">
            {user.players.map((player) => (
              <div key={player.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{player.name}</h3>
                    <p className="text-sm text-gray-500">ID: {player.id}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    player.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {player.active ? 'アクティブ' : '無効'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">所持金</label>
                    <p className="mt-1 text-sm text-gray-900">{player.gold.toLocaleString()} G</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">作成日時</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(player.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">最終ログイン</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(player.last_login_at)}</p>
                  </div>
                </div>

                {player.job_classes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">習得職業</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {player.job_classes.map((jobClass) => (
                        <div key={jobClass.id} className="border border-gray-200 rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{jobClass.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded ${getJobTypeColor(jobClass.job_type)}`}>
                              {getJobTypeName(jobClass.job_type)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>レベル: {jobClass.level}</p>
                            <p>経験値: {jobClass.experience.toLocaleString()}</p>
                            <p>習得日: {formatDate(jobClass.unlocked_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </AdminLayout>
    </AuthGuard>
  )
}