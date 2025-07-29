'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

interface Player {
  id: number
  name: string
  level: number
  created_at: string
  last_login_at?: string
  user: {
    id: number
    username: string
  }
  job_classes: Array<{
    id: number
    name: string
    job_type: string
    current_level: number
    current_experience: number
  }>
}

export default function PlayersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchPlayers()
    }
  }, [user])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/admin/players')
      setPlayers(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プレイヤーの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">プレイヤー管理</h1>
              </div>
              <div className="flex items-center space-x-2">
                <a href="/dashboard" className="text-blue-500 hover:text-blue-700">ダッシュボード</a>
                <a href="/users" className="text-blue-500 hover:text-blue-700">ユーザー管理</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">読み込み中...</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">プレイヤー管理</h1>
              </div>
              <div className="flex items-center space-x-2">
                <a href="/dashboard" className="text-blue-500 hover:text-blue-700">ダッシュボード</a>
                <a href="/users" className="text-blue-500 hover:text-blue-700">ユーザー管理</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-700">エラー: {error}</div>
              <button
                onClick={fetchPlayers}
                className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                再試行
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">プレイヤー管理</h1>
            </div>
            <div className="flex items-center space-x-2">
              <a href="/dashboard" className="text-blue-500 hover:text-blue-700">ダッシュボード</a>
              <a href="/users" className="text-blue-500 hover:text-blue-700">ユーザー管理</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  プレイヤー一覧 ({players.length}人)
                </h3>
                <button
                  onClick={fetchPlayers}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  更新
                </button>
              </div>
              
              <div className="space-y-4">
                {players.map((player) => (
                  <div key={player.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{player.name}</h4>
                        <p className="text-sm text-gray-500">
                          ユーザー: {player.user.username} (ID: {player.user.id})
                        </p>
                        <p className="text-sm text-gray-500">
                          作成日: {new Date(player.created_at).toLocaleString('ja-JP')}
                        </p>
                        {player.last_login_at && (
                          <p className="text-sm text-gray-500">
                            最終ログイン: {new Date(player.last_login_at).toLocaleString('ja-JP')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-600">Lv.{player.level}</div>
                        <div className="text-sm text-gray-500">プレイヤーID: {player.id}</div>
                      </div>
                    </div>
                    
                    {player.job_classes.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">習得職業:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {player.job_classes.map((job) => (
                            <div key={job.id} className="bg-gray-50 p-2 rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{job.name}</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  job.job_type === 'basic' ? 'bg-green-100 text-green-800' :
                                  job.job_type === 'advanced' ? 'bg-blue-100 text-blue-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {job.job_type === 'basic' ? '基本職' : 
                                   job.job_type === 'advanced' ? '上級職' : '特殊職'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Lv.{job.current_level} (EXP: {job.current_experience})
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}