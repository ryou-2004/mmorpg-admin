'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface JobClassDetail {
  id: number
  name: string
  description: string
  job_type: string
  max_level: number
  experience_multiplier: number
  base_stats: {
    hp: number
    mp: number
    attack: number
    defense: number
    magic_attack: number
    magic_defense: number
    agility: number
    luck: number
  }
  multipliers: {
    hp: number
    mp: number
    attack: number
    defense: number
    magic_attack: number
    magic_defense: number
    agility: number
    luck: number
  }
  stats: {
    total_characters: number
    average_level: number
    max_level_reached: number
    level_distribution: { [key: string]: number }
  }
  top_characters: Array<{
    character_name: string
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
  }>
}

export default function JobClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [jobClass, setJobClass] = useState<JobClassDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJobClass()
  }, [params.id])

  const fetchJobClass = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<JobClassDetail>(`/admin/job_classes/${params.id}?test=true`)
      setJobClass(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : '職業データの取得に失敗しました')
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

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="職業詳細" showBackButton backHref="/job-classes">
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
        <AdminLayout title="職業詳細" showBackButton backHref="/job-classes">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">エラー: {error}</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (!jobClass) {
    return (
      <AuthGuard>
        <AdminLayout title="職業詳細" showBackButton backHref="/job-classes">
          <div className="text-center text-gray-500">職業が見つかりません</div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdminLayout title={`職業詳細: ${jobClass.name}`} showBackButton backHref="/job-classes">
        <div className="space-y-6">
          {/* 基本情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{jobClass.name}</h2>
                <p className="mt-1 text-gray-600">{jobClass.description}</p>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getJobTypeBadge(jobClass.job_type)}`}>
                {getJobTypeDisplay(jobClass.job_type)}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">最大レベル</label>
                <p className="mt-1 text-lg font-semibold">{jobClass.max_level}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">経験値倍率</label>
                <p className="mt-1 text-lg font-semibold">{jobClass.experience_multiplier}x</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <p className="mt-1 text-lg font-semibold">{jobClass.id}</p>
              </div>
            </div>
          </div>

          {/* 基本ステータス */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">基本ステータス</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">HP</label>
                <p className="mt-1 text-lg">{jobClass.base_stats.hp}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">MP</label>
                <p className="mt-1 text-lg">{jobClass.base_stats.mp}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">攻撃力</label>
                <p className="mt-1 text-lg">{jobClass.base_stats.attack}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">防御力</label>
                <p className="mt-1 text-lg">{jobClass.base_stats.defense}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">魔法攻撃力</label>
                <p className="mt-1 text-lg">{jobClass.base_stats.magic_attack}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">魔法防御力</label>
                <p className="mt-1 text-lg">{jobClass.base_stats.magic_defense}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">素早さ</label>
                <p className="mt-1 text-lg">{jobClass.base_stats.agility}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">運</label>
                <p className="mt-1 text-lg">{jobClass.base_stats.luck}</p>
              </div>
            </div>
          </div>

          {/* 成長率 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">成長率 (レベルアップ時の上昇値)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">HP</label>
                <p className="mt-1 text-lg">+{jobClass.multipliers.hp}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">MP</label>
                <p className="mt-1 text-lg">+{jobClass.multipliers.mp}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">攻撃力</label>
                <p className="mt-1 text-lg">+{jobClass.multipliers.attack}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">防御力</label>
                <p className="mt-1 text-lg">+{jobClass.multipliers.defense}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">魔法攻撃力</label>
                <p className="mt-1 text-lg">+{jobClass.multipliers.magic_attack}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">魔法防御力</label>
                <p className="mt-1 text-lg">+{jobClass.multipliers.magic_defense}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">素早さ</label>
                <p className="mt-1 text-lg">+{jobClass.multipliers.agility}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">運</label>
                <p className="mt-1 text-lg">+{jobClass.multipliers.luck}</p>
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">統計情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{jobClass.stats.total_characters}</div>
                <div className="text-xs text-gray-500">習得キャラクター数</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{jobClass.stats.average_level}</div>
                <div className="text-xs text-gray-500">平均レベル</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{jobClass.stats.max_level_reached}</div>
                <div className="text-xs text-gray-500">最高到達レベル</div>
              </div>
            </div>
          </div>

          {/* トップキャラクター */}
          {jobClass.top_characters.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">トップキャラクター</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">キャラクター名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">レベル</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">経験値</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">攻撃力</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">防御力</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jobClass.top_characters.map((character, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{character.character_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{character.level}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{character.experience.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{character.stats.hp}/{character.stats.max_hp}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{character.stats.mp}/{character.stats.max_mp}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{character.stats.attack}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{character.stats.defense}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-center space-x-4">
              <Link
                href={`/job-classes/${jobClass.id}/edit`}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
              >
                編集
              </Link>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}