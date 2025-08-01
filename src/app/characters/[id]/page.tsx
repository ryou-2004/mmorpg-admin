'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface CharacterDetails {
  id: number
  name: string
  gold: number
  active: boolean
  created_at: string
  last_login_at?: string
  user: {
    id: number
    name: string
    email: string
  }
  current_job_class: {
    id: number
    level: number
    experience: number
    skill_points: number
    job_class: {
      id: number
      name: string
      job_type: string
    }
  }
  job_classes: Array<{
    id: number
    job_class: {
      id: number
      name: string
      job_type: string
      max_level: number
    }
    level: number
    experience: number
    skill_points: number
    unlocked_at: string
  }>
  warehouses: Array<{
    id: number
    name: string
    max_slots: number
    used_slots: number
  }>
  inventory_count: number
  equipped_count: number
}

export default function CharacterDetailPage() {
  const params = useParams()
  const characterId = params.id as string
  
  const [character, setCharacter] = useState<CharacterDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (characterId) {
      fetchCharacterDetails()
    }
  }, [characterId])

  const fetchCharacterDetails = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<CharacterDetails>(`/admin/characters/${characterId}`)
      setCharacter(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'キャラクター詳細の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="キャラクター詳細" showBackButton backHref="/characters">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">読み込み中...</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (error || !character) {
    return (
      <AuthGuard>
        <AdminLayout title="キャラクター詳細" showBackButton backHref="/characters">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">エラー: {error || 'キャラクターが見つかりません'}</div>
            <button
              onClick={fetchCharacterDetails}
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
      <AdminLayout title={`キャラクター詳細: ${character.name}`} showBackButton backHref="/characters">
        <div className="space-y-6">
          {/* 基本情報 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">基本情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">キャラクター名</label>
                  <div className="mt-1 text-sm text-gray-900">{character.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">キャラクターID</label>
                  <div className="mt-1 text-sm text-gray-900">{character.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">所持金</label>
                  <div className="mt-1 text-sm text-gray-900">{character.gold.toLocaleString()} G</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ステータス</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      character.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {character.active ? 'アクティブ' : '無効'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ユーザー</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {character.user.name} ({character.user.email})
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">作成日</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {new Date(character.created_at).toLocaleString('ja-JP')}
                  </div>
                </div>
                {character.last_login_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">最終ログイン</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {new Date(character.last_login_at).toLocaleString('ja-JP')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 現在の職業 */}
          {character.current_job_class && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">現在の職業</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">職業名</label>
                    <div className="mt-1 text-sm text-gray-900">{character.current_job_class.job_class.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">レベル</label>
                    <div className="mt-1 text-sm text-gray-900">Lv.{character.current_job_class.level}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">経験値</label>
                    <div className="mt-1 text-sm text-gray-900">{character.current_job_class.experience.toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">スキルポイント</label>
                    <div className="mt-1 text-sm text-gray-900">{character.current_job_class.skill_points}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* アイテム情報 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">アイテム管理</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href={`/characters/${character.id}/inventory`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{character.inventory_count}</div>
                    <div className="text-sm text-gray-600">インベントリ</div>
                  </div>
                </Link>
                <Link
                  href={`/characters/${character.id}/warehouse`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {character.warehouses.reduce((sum, w) => sum + w.used_slots, 0)}
                    </div>
                    <div className="text-sm text-gray-600">倉庫 ({character.warehouses.length}個)</div>
                  </div>
                </Link>
                <Link
                  href={`/characters/${character.id}/equipment`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{character.equipped_count}</div>
                    <div className="text-sm text-gray-600">装備中</div>
                  </div>
                </Link>
              </div>
              
              {/* 倉庫一覧 */}
              {character.warehouses.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">倉庫一覧</h4>
                  <div className="space-y-2">
                    {character.warehouses.map((warehouse) => (
                      <div key={warehouse.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{warehouse.name}</span>
                          <span className="ml-2 text-sm text-gray-500">
                            ({warehouse.used_slots}/{warehouse.max_slots})
                          </span>
                        </div>
                        <Link
                          href={`/characters/${character.id}/warehouse/${warehouse.id}`}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          詳細
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 習得職業 */}
          {character.job_classes.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  習得職業 ({character.job_classes.length}個)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {character.job_classes.map((job) => (
                    <Link
                      key={job.id}
                      href={`/characters/${character.id}/job-classes/${job.id}`}
                      className="block bg-gray-50 p-4 rounded-lg hover:shadow-md hover:border-blue-300 border border-transparent transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">{job.job_class.name}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          job.job_class.job_type === 'basic' ? 'bg-blue-100 text-blue-800' :
                          job.job_class.job_type === 'advanced' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {job.job_class.job_type === 'basic' ? '基本職' : 
                           job.job_class.job_type === 'advanced' ? '上級職' : '特殊職'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>レベル: {job.level}</div>
                        <div>経験値: {job.experience.toLocaleString()}</div>
                        <div>スキルポイント: {job.skill_points}</div>
                        <div>習得日: {new Date(job.unlocked_at).toLocaleDateString('ja-JP')}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}