'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface Player {
  id: number
  name: string
  gold: number
  active: boolean
  created_at: string
  last_login_at?: string
  current_job?: {
    job_name: string
    level: number
    experience: number
    skill_points: number
    stats: {
      hp: number
      max_hp: number
      mp: number
      max_mp: number
      attack: number
      defense: number
      magic_attack: number
      magic_defense: number
      agility: number
      luck: number
    }
  }
  user: {
    id: number
    name: string
    email: string
  }
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<{ data: Player[] }>('/admin/players')
      setPlayers(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プレイヤーの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="プレイヤー管理">
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
        <AdminLayout title="プレイヤー管理">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">エラー: {error}</div>
            <button
              onClick={fetchPlayers}
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
      <AdminLayout title="プレイヤー管理">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player) => (
                <div key={player.id} className="relative">
                  <Link href={`/players/${player.id}`} className="block">
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{player.name}</h4>
                        <span className="text-sm text-gray-500">ID: {player.id}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">ゴールド:</span>
                          <span className="ml-1 font-medium">{player.gold.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">レベル:</span>
                          <span className="ml-1 font-medium">{player.current_job?.level || '-'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">職業:</span>
                          <span className="ml-1 font-medium">{player.current_job?.job_name || '未設定'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">最終ログイン:</span>
                          <span className="ml-1 font-medium">
                            {player.last_login_at ? 
                              new Date(player.last_login_at).toLocaleDateString('ja-JP') : 
                              '未ログイン'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">ユーザー:</span>
                          <span className="text-sm font-medium">{player.user.name}</span>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          player.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {player.active ? 'アクティブ' : '無効'}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="absolute top-2 right-2 z-10">
                    <Link
                      href={`/players/${player.id}/edit`}
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