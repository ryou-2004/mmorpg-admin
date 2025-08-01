'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface CharacterJobClass {
  id: number
  character: {
    id: number
    name: string
  }
  job_class: {
    id: number
    name: string
    job_type: string
    max_level: number
    description: string
  }
  level: number
  experience: number
  skill_points: number
  exp_to_next_level: number
  level_progress: number
  is_current: boolean
  unlocked_at: string
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
  same_job_rankings: Array<{
    character_name: string
    level: number
    experience: number
  }>
  level_history: Array<{
    level: number
    hp: number
    mp: number
    attack: number
    defense: number
  }>
}

export default function CharacterJobClassDetailPage() {
  const params = useParams()
  const characterId = params.id as string
  const jobClassId = params.jobClassId as string
  
  const [characterJobClass, setCharacterJobClass] = useState<CharacterJobClass | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCharacterJobClass()
  }, [jobClassId])

  const fetchCharacterJobClass = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<CharacterJobClass>(`/admin/characters/${characterId}/character_job_classes/${jobClassId}?test=true`)
      setCharacterJobClass(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : '習得職業データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getJobTypeBadge = (jobType: string) => {
    switch (jobType) {
      case 'basic': return 'bg-blue-100 text-blue-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      case 'special': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getJobTypeDisplay = (jobType: string) => {
    switch (jobType) {
      case 'basic': return '基本職'
      case 'advanced': return '上級職'
      case 'special': return '特殊職'
      default: return jobType
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP')
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="習得職業詳細" showBackButton backHref={`/characters/${characterId}`}>
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
        <AdminLayout title="習得職業詳細" showBackButton backHref={`/characters/${characterId}`}>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">エラー: {error}</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (!characterJobClass) {
    return (
      <AuthGuard>
        <AdminLayout title="習得職業詳細" showBackButton backHref={`/characters/${characterId}`}>
          <div className="text-center text-gray-500">習得職業が見つかりません</div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdminLayout title={`${characterJobClass.character.name}の${characterJobClass.job_class.name}`} showBackButton backHref={`/characters/${characterId}`}>
        <div className="space-y-6">
          {/* 基本情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{characterJobClass.job_class.name}</h2>
                <p className="mt-1 text-gray-600">キャラクター: {characterJobClass.character.name}</p>
                {characterJobClass.job_class.description && (
                  <p className="mt-2 text-gray-600">{characterJobClass.job_class.description}</p>
                )}
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getJobTypeBadge(characterJobClass.job_class.job_type)}`}>
                  {getJobTypeDisplay(characterJobClass.job_class.job_type)}
                </span>
                {characterJobClass.is_current && (
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                    現在の職業
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">レベル</label>
                <p className="mt-1 text-2xl font-bold text-blue-600">{characterJobClass.level}</p>
                <p className="text-xs text-gray-500">最大: {characterJobClass.job_class.max_level}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">経験値</label>
                <p className="mt-1 text-lg font-semibold">{characterJobClass.experience.toLocaleString()}</p>
                {characterJobClass.level < characterJobClass.job_class.max_level && (
                  <p className="text-xs text-gray-500">次まであと: {characterJobClass.exp_to_next_level.toLocaleString()}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">スキルポイント</label>
                <p className="mt-1 text-lg font-semibold text-purple-600">{characterJobClass.skill_points}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">習得日時</label>
                <p className="mt-1 text-sm">{formatDate(characterJobClass.unlocked_at)}</p>
              </div>
            </div>

            {/* レベル進捗バー */}
            {characterJobClass.level < characterJobClass.job_class.max_level && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>レベル進捗</span>
                  <span>{characterJobClass.level_progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${characterJobClass.level_progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* 現在のステータス */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">現在のステータス</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{characterJobClass.stats.hp}</div>
                <div className="text-xs text-gray-500">HP (最大: {characterJobClass.stats.max_hp})</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{characterJobClass.stats.mp}</div>
                <div className="text-xs text-gray-500">MP (最大: {characterJobClass.stats.max_mp})</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{characterJobClass.stats.attack}</div>
                <div className="text-xs text-gray-500">攻撃力</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{characterJobClass.stats.defense}</div>
                <div className="text-xs text-gray-500">防御力</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{characterJobClass.stats.magic_attack}</div>
                <div className="text-xs text-gray-500">魔法攻撃力</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{characterJobClass.stats.magic_defense}</div>
                <div className="text-xs text-gray-500">魔法防御力</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{characterJobClass.stats.agility}</div>
                <div className="text-xs text-gray-500">素早さ</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{characterJobClass.stats.luck}</div>
                <div className="text-xs text-gray-500">運</div>
              </div>
            </div>
          </div>

          {/* 同職業ランキング */}
          {characterJobClass.same_job_rankings.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">同職業ランキング（上位5名）</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">順位</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">キャラクター名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">レベル</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">経験値</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {characterJobClass.same_job_rankings.map((ranking, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ranking.character_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ranking.level}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ranking.experience.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* レベル別ステータス履歴 */}
          {characterJobClass.level_history.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">レベル別ステータス履歴（最新10レベル）</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">レベル</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">攻撃力</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">防御力</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {characterJobClass.level_history.map((history) => (
                      <tr key={history.level} className={history.level === characterJobClass.level ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {history.level}
                          {history.level === characterJobClass.level && (
                            <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              現在
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{history.hp}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{history.mp}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{history.attack}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{history.defense}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}