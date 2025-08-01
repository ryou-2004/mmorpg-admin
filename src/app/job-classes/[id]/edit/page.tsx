'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface JobClassFormData {
  name: string
  description: string
  job_type: string
  max_level: number
  exp_multiplier: number
  base_hp: number
  base_mp: number
  base_attack: number
  base_defense: number
  base_magic_attack: number
  base_magic_defense: number
  base_agility: number
  base_luck: number
  hp_multiplier: number
  mp_multiplier: number
  attack_multiplier: number
  defense_multiplier: number
  magic_attack_multiplier: number
  magic_defense_multiplier: number
  agility_multiplier: number
  luck_multiplier: number
}

interface JobClass {
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
}

export default function EditJobClassPage() {
  const params = useParams()
  const router = useRouter()
  const [jobClass, setJobClass] = useState<JobClass | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<JobClassFormData>({
    name: '',
    description: '',
    job_type: 'basic',
    max_level: 100,
    exp_multiplier: 1.0,
    base_hp: 0,
    base_mp: 0,
    base_attack: 0,
    base_defense: 0,
    base_magic_attack: 0,
    base_magic_defense: 0,
    base_agility: 0,
    base_luck: 0,
    hp_multiplier: 0,
    mp_multiplier: 0,
    attack_multiplier: 0,
    defense_multiplier: 0,
    magic_attack_multiplier: 0,
    magic_defense_multiplier: 0,
    agility_multiplier: 0,
    luck_multiplier: 0
  })

  useEffect(() => {
    fetchJobClass()
  }, [params.id])

  const fetchJobClass = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<JobClass>(`/admin/job_classes/${params.id}?test=true`)
      setJobClass(response)
      
      // フォームデータに設定
      setFormData({
        name: response.name,
        description: response.description || '',
        job_type: response.job_type,
        max_level: response.max_level,
        exp_multiplier: response.experience_multiplier,
        base_hp: response.base_stats.hp,
        base_mp: response.base_stats.mp,
        base_attack: response.base_stats.attack,
        base_defense: response.base_stats.defense,
        base_magic_attack: response.base_stats.magic_attack,
        base_magic_defense: response.base_stats.magic_defense,
        base_agility: response.base_stats.agility,
        base_luck: response.base_stats.luck,
        hp_multiplier: response.multipliers.hp,
        mp_multiplier: response.multipliers.mp,
        attack_multiplier: response.multipliers.attack,
        defense_multiplier: response.multipliers.defense,
        magic_attack_multiplier: response.multipliers.magic_attack,
        magic_defense_multiplier: response.multipliers.magic_defense,
        agility_multiplier: response.multipliers.agility,
        luck_multiplier: response.multipliers.luck
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '職業データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await apiClient.put(`/admin/job_classes/${params.id}?test=true`, {
        job_class: formData
      })
      router.push(`/job-classes/${params.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '職業データの更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof JobClassFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="職業編集" showBackButton backHref={`/job-classes/${params.id}`}>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">読み込み中...</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (error && !jobClass) {
    return (
      <AuthGuard>
        <AdminLayout title="職業編集" showBackButton backHref="/job-classes">
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
        <AdminLayout title="職業編集" showBackButton backHref="/job-classes">
          <div className="text-center text-gray-500">職業が見つかりません</div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdminLayout title={`職業編集: ${jobClass.name}`} showBackButton backHref={`/job-classes/${params.id}`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-700">エラー: {error}</div>
            </div>
          )}

          {/* 基本情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">基本情報</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  職業名 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  職業タイプ *
                </label>
                <select
                  required
                  value={formData.job_type}
                  onChange={(e) => handleInputChange('job_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="basic">基本職</option>
                  <option value="advanced">上級職</option>
                  <option value="special">特殊職</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大レベル *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="999"
                  value={formData.max_level}
                  onChange={(e) => handleInputChange('max_level', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  経験値倍率 *
                </label>
                <input
                  type="number"
                  required
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={formData.exp_multiplier}
                  onChange={(e) => handleInputChange('exp_multiplier', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 基本ステータス */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">基本ステータス (レベル1時の値)</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HP</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.base_hp}
                  onChange={(e) => handleInputChange('base_hp', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MP</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.base_mp}
                  onChange={(e) => handleInputChange('base_mp', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">攻撃力</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.base_attack}
                  onChange={(e) => handleInputChange('base_attack', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">防御力</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.base_defense}
                  onChange={(e) => handleInputChange('base_defense', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">魔法攻撃力</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.base_magic_attack}
                  onChange={(e) => handleInputChange('base_magic_attack', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">魔法防御力</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.base_magic_defense}
                  onChange={(e) => handleInputChange('base_magic_defense', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">素早さ</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.base_agility}
                  onChange={(e) => handleInputChange('base_agility', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">運</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.base_luck}
                  onChange={(e) => handleInputChange('base_luck', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 成長率 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">成長率 (レベルアップ時の上昇値)</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HP成長率</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.hp_multiplier}
                  onChange={(e) => handleInputChange('hp_multiplier', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MP成長率</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.mp_multiplier}
                  onChange={(e) => handleInputChange('mp_multiplier', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">攻撃力成長率</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.attack_multiplier}
                  onChange={(e) => handleInputChange('attack_multiplier', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">防御力成長率</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.defense_multiplier}
                  onChange={(e) => handleInputChange('defense_multiplier', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">魔法攻撃力成長率</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.magic_attack_multiplier}
                  onChange={(e) => handleInputChange('magic_attack_multiplier', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">魔法防御力成長率</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.magic_defense_multiplier}
                  onChange={(e) => handleInputChange('magic_defense_multiplier', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">素早さ成長率</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.agility_multiplier}
                  onChange={(e) => handleInputChange('agility_multiplier', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">運成長率</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={formData.luck_multiplier}
                  onChange={(e) => handleInputChange('luck_multiplier', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push(`/job-classes/${params.id}`)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '更新中...' : '更新'}
            </button>
          </div>
        </form>
      </AdminLayout>
    </AuthGuard>
  )
}