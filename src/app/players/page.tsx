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
            
            <div className="space-y-4">
              {players.map((player) => (
                <div key={player.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{player.name}</h4>
                      <p className="text-sm text-gray-500">
                        ユーザー: {player.user.name} ({player.user.email})
                      </p>
                      <p className="text-sm text-gray-500">
                        所持金: {player.gold.toLocaleString()} G
                      </p>
                      <p className="text-sm text-gray-500">
                        作成日: {new Date(player.created_at).toLocaleString('ja-JP')}
                      </p>
                      {player.last_login_at && (
                        <p className="text-sm text-gray-500">
                          最終ログイン: {new Date(player.last_login_at).toLocaleString('ja-JP')}
                        </p>
                      )}
                      {player.current_job && (
                        <p className="text-sm font-medium text-blue-600">
                          現在の職業: {player.current_job.job_name} Lv.{player.current_job.level}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">プレイヤーID: {player.id}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        player.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {player.active ? 'アクティブ' : '無効'}
                      </span>
                      <div className="mt-2">
                        <Link
                          href={`/players/${player.id}`}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                        >
                          詳細
                        </Link>
                      </div>
                    </div>
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